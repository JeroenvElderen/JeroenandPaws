import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const isValidInvoiceId = (value: string): boolean =>
  /^[A-Za-z0-9_\-]{6,128}$/.test(value);

function pdfFileName(invoiceNumber: string | null, invoiceId: string): string {
  const rawName = invoiceNumber?.trim() || invoiceId;
  const safeName = rawName.replace(/[^A-Za-z0-9_.-]+/g, "-");
  return `invoice-${safeName}.pdf`;
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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET")
    return res.status(405).json({ error: "Method not allowed" });

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
      .select("id, invoice_number, revolut_invoice_number, revolut_pdf_url")
      .eq("id", invoiceId)
      .maybeSingle();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    const revolutPdfUrl =
      typeof invoice?.revolut_pdf_url === "string"
        ? invoice.revolut_pdf_url.trim()
        : "";
    const revolutInvoiceNumber =
      typeof invoice?.revolut_invoice_number === "string"
        ? invoice.revolut_invoice_number.trim()
        : null;

    console.log({
      invoiceId,
      revolutPdfUrl,
      revolutInvoiceNumber,
    });

    if (!invoice || !revolutPdfUrl || !/^https?:\/\//i.test(revolutPdfUrl)) {
      return res.status(404).json({ error: "Official Revolut PDF not found" });
    }

    const upstream = await fetchOfficialPdf(revolutPdfUrl);
    if (!upstream.ok) {
      return res.status(404).json({ error: "Official Revolut PDF not found" });
    }

    const bytes = Buffer.from(await upstream.arrayBuffer());
    res.setHeader(
      "Content-Type",
      upstream.headers.get("content-type") || "application/pdf",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${pdfFileName(revolutInvoiceNumber ?? invoice.invoice_number ?? null, invoiceId)}"`,
    );
    return res.status(200).send(bytes);
  } catch (error) {
    console.error("Failed to proxy official Revolut PDF", error);
    return res
      .status(500)
      .json({ error: "Failed to proxy official Revolut PDF" });
  }
}
