import type { NextApiRequest, NextApiResponse } from "next";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const PDF_BUCKET =
  process.env.SUPABASE_INVOICE_PDF_BUCKET?.trim() || "invoice-pdfs";

const isValidInvoiceId = (value: string): boolean =>
  /^[A-Za-z0-9_\-]{6,128}$/.test(value);

type InvoiceRow = {
  id: string;
  invoice_number: string | null;
  external_invoice_id: string | null;
  revolut_invoice_number: string | null;
  revolut_pdf_url: string | null;
  revolut_pdf_storage_path: string | null;
};

type PdfPayload = {
  bytes: Buffer;
  contentType: string;
};

function pdfFileName(invoiceNumber: string | null, invoiceId: string): string {
  const rawName = invoiceNumber?.trim() || invoiceId;
  const safeName = rawName.replace(/[^A-Za-z0-9_.-]+/g, "-");
  return `invoice-${safeName}.pdf`;
}

function storagePathForInvoice(invoice: InvoiceRow, invoiceId: string): string {
  const externalId = invoice.external_invoice_id?.trim() || invoiceId;
  const safeId = externalId.replace(/[^A-Za-z0-9_.-]+/g, "-");
  return `revolut/${invoiceId}/${safeId}.pdf`;
}

function buildMerchantUrl(path: string): string {
  const baseUrl =
    process.env.REVOLUT_MERCHANT_BASE_URL?.trim() ||
    "https://merchant.revolut.com";
  return new URL(path, baseUrl).toString();
}

async function fetchRevolutJson(path: string) {
  const merchantKey = process.env.REVOLUT_MERCHANT_API_KEY;
  const apiVersion =
    process.env.REVOLUT_MERCHANT_API_VERSION?.trim() || "2024-09-01";

  if (!merchantKey) {
    throw new Error("Missing Revolut merchant API key");
  }

  const response = await fetch(buildMerchantUrl(path), {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${merchantKey}`,
      "Revolut-Api-Version": apiVersion,
    },
  });

  if (!response.ok) {
    return null;
  }

  return response.json();
}

async function fetchRevolutInvoiceById(externalInvoiceId: string) {
  const invoicesPath =
    process.env.REVOLUT_INVOICES_PATH?.trim() || "/api/invoices";
  const normalizedInvoicesPath = invoicesPath.replace(/\/+$/, "");
  const encodedId = encodeURIComponent(externalInvoiceId);

  const invoice = await fetchRevolutJson(
    `${normalizedInvoicesPath}/${encodedId}`,
  );
  if (invoice) {
    return invoice;
  }

  return fetchRevolutJson(`/api/orders/${encodedId}`);
}

function findFirstString(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

function findFirstPdfLikeUrl(value: unknown): string | null {
  const seen = new Set<unknown>();
  const queue: unknown[] = [value];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || seen.has(current)) {
      continue;
    }
    seen.add(current);

    if (Array.isArray(current)) {
      queue.push(...current);
      continue;
    }

    if (typeof current !== "object") {
      continue;
    }

    for (const [key, nestedValue] of Object.entries(current)) {
      if (
        typeof nestedValue === "string" &&
        /^https?:\/\//i.test(nestedValue)
      ) {
        const normalizedKey = key.toLowerCase();
        const normalizedValue = nestedValue.toLowerCase();
        if (
          normalizedKey.includes("pdf") ||
          normalizedKey.includes("invoice") ||
          normalizedKey.includes("document") ||
          normalizedKey.includes("receipt") ||
          normalizedValue.includes(".pdf")
        ) {
          return nestedValue.trim();
        }
      } else if (nestedValue && typeof nestedValue === "object") {
        queue.push(nestedValue);
      }
    }
  }

  return null;
}

function extractPdfUrl(revolutInvoice: any): string | null {
  return (
    findFirstString(
      revolutInvoice?.invoice_url,
      revolutInvoice?.receipt_url,
      revolutInvoice?.document_url,
      revolutInvoice?.pdf_url,
      revolutInvoice?.documents?.[0]?.url,
      revolutInvoice?.receipts?.[0]?.url,
      revolutInvoice?.invoice?.pdf_url,
      revolutInvoice?.invoice?.invoice_url,
      revolutInvoice?.invoice?.document_url,
    ) ?? findFirstPdfLikeUrl(revolutInvoice)
  );
}

function extractInvoiceNumber(revolutInvoice: any): string | null {
  return findFirstString(
    revolutInvoice?.number,
    revolutInvoice?.invoice?.number,
  );
}

async function fetchOfficialPdf(revolutPdfUrl: string): Promise<Response> {
  const merchantKey = process.env.REVOLUT_MERCHANT_API_KEY;
  const apiVersion =
    process.env.REVOLUT_MERCHANT_API_VERSION?.trim() || "2024-09-01";
  const headers: Record<string, string> = {
    Accept: "application/pdf",
    "Revolut-Api-Version": apiVersion,
  };

  if (merchantKey) {
    headers.Authorization = `Bearer ${merchantKey}`;
  }

  return fetch(revolutPdfUrl, { headers });
}

async function downloadFromStorage(
  supabase: SupabaseClient,
  storagePath: string,
): Promise<PdfPayload | null> {
  const { data, error } = await supabase.storage
    .from(PDF_BUCKET)
    .download(storagePath);

  if (error || !data) {
    return null;
  }

  return {
    bytes: Buffer.from(await data.arrayBuffer()),
    contentType: data.type || "application/pdf",
  };
}

async function uploadPdfToStorage(
  supabase: SupabaseClient,
  storagePath: string,
  payload: PdfPayload,
): Promise<void> {
  const { error } = await supabase.storage
    .from(PDF_BUCKET)
    .upload(storagePath, payload.bytes, {
      contentType: payload.contentType || "application/pdf",
      upsert: true,
    });

  if (error) {
    throw new Error(`Supabase PDF upload failed: ${error.message}`);
  }
}

async function loadAndCacheOfficialPdf(
  supabase: SupabaseClient,
  invoice: InvoiceRow,
  invoiceId: string,
  revolutPdfUrl: string,
): Promise<PdfPayload> {
  const upstream = await fetchOfficialPdf(revolutPdfUrl);
  if (!upstream.ok) {
    throw new Error("Official Revolut PDF not found");
  }

  const contentType = upstream.headers.get("content-type") || "application/pdf";
  const storagePath =
    invoice.revolut_pdf_storage_path?.trim() ||
    storagePathForInvoice(invoice, invoiceId);
  const payload = {
    bytes: Buffer.from(await upstream.arrayBuffer()),
    contentType,
  };

  await uploadPdfToStorage(supabase, storagePath, payload);
  await supabase
    .from("invoices")
    .update({ revolut_pdf_storage_path: storagePath })
    .eq("id", invoiceId);

  const storedPayload = await downloadFromStorage(supabase, storagePath);

  return storedPayload ?? payload;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const invoiceId =
      typeof req.query.id === "string"
        ? req.query.id.trim()
        : typeof req.query.orderId === "string"
          ? req.query.orderId.trim()
          : "";

    if (!invoiceId || !isValidInvoiceId(invoiceId)) {
      return res.status(400).json({ error: "Invalid invoice id" });
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return res.status(500).json({ error: "Missing Supabase configuration" });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
    const { data: invoice, error } = await supabase
      .from("invoices")
      .select(
        "id, invoice_number, external_invoice_id, revolut_invoice_number, revolut_pdf_url, revolut_pdf_storage_path",
      )
      .eq("id", invoiceId)
      .maybeSingle();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    if (!invoice) {
      return res.status(404).json({
        error: "Invoice row not found",
      });
    }

    const invoiceRow = invoice as InvoiceRow;
    let storagePayload = invoiceRow.revolut_pdf_storage_path
      ? await downloadFromStorage(supabase, invoiceRow.revolut_pdf_storage_path)
      : null;

    let revolutPdfUrl = invoiceRow.revolut_pdf_url?.trim() || "";
    let revolutInvoiceNumber =
      invoiceRow.revolut_invoice_number?.trim() || null;

    if (!storagePayload) {
      if (!revolutPdfUrl && invoiceRow.external_invoice_id) {
        const revolutInvoice = await fetchRevolutInvoiceById(
          String(invoiceRow.external_invoice_id),
        );

        revolutPdfUrl = extractPdfUrl(revolutInvoice) ?? "";
        revolutInvoiceNumber =
          extractInvoiceNumber(revolutInvoice) ?? revolutInvoiceNumber;

        if (revolutPdfUrl) {
          await supabase
            .from("invoices")
            .update({
              revolut_pdf_url: revolutPdfUrl,
              revolut_invoice_number: revolutInvoiceNumber,
            })
            .eq("id", invoiceId);
        }
      }

      if (!revolutPdfUrl || !/^https?:\/\//i.test(revolutPdfUrl)) {
        return res.status(404).json({
          error: "Invoice exists but no Revolut PDF URL was found",
          invoiceId,
          externalInvoiceId: invoiceRow.external_invoice_id,
        });
      }

      try {
        storagePayload = await loadAndCacheOfficialPdf(
          supabase,
          invoiceRow,
          invoiceId,
          revolutPdfUrl,
        );
      } catch (pdfError) {
        const message =
          pdfError instanceof Error
            ? pdfError.message
            : "Official Revolut PDF not found";
        const status = message.startsWith("Supabase") ? 500 : 404;
        return res.status(status).json({ error: message });
      }
    }

    if (!storagePayload) {
      return res.status(404).json({ error: "Stored invoice PDF not found" });
    }

    res.setHeader(
      "Content-Type",
      storagePayload.contentType || "application/pdf",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${pdfFileName(
        revolutInvoiceNumber ?? invoiceRow.invoice_number ?? null,
        invoiceId,
      )}"`,
    );
    return res.status(200).send(storagePayload.bytes);
  } catch (error) {
    console.error("Failed to proxy stored Revolut PDF", error);
    return res
      .status(500)
      .json({ error: "Failed to proxy stored Revolut PDF" });
  }
}
