import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { revolutMerchantGet } from "@/lib/revolut/proxy";

export const runtime = "nodejs";

const PDF_BUCKET =
  process.env.SUPABASE_INVOICE_PDF_BUCKET?.trim() || "invoice-pdfs";

type RevolutCustomer = {
  id?: string;
  email?: string;
  full_name?: string;
};

type ExternalInvoice = {
  id: string;
  number?: string;
  customer_name?: string;
  customer?: string | RevolutCustomer;
  total_amount?: number;
  amount?: number;
  currency?: string;
  status?: string;
  state?: string;
  due_date?: string;
  created_at?: string;
  issued_at?: string;
  invoice_url?: string;
  receipt_url?: string;
  document_url?: string;
  public_url?: string;
  payment_url?: string;
  url?: string;
  hosted_invoice_url?: string;
  documents?: Array<{ url?: string }>;
  receipts?: Array<{ url?: string }>;
  invoice?: { pdf_url?: string; public_url?: string; number?: string };
};

type RevolutOrder = {
  id: string;
  token?: string;
  type?: string;
  state?: string;
  created_at?: string;
  updated_at?: string;
  amount?: number;
  currency?: string;
  description?: string;
  customer?: RevolutCustomer;
  merchant_order_data?: {
    reference?: string;
  };
};

function toCents(amount?: number): number {
  if (typeof amount !== "number" || Number.isNaN(amount)) return 0;
  return Math.round(amount);
}

function normalizeName(v: string): string {
  return v.trim().toLowerCase().replace(/\s+/g, " ");
}

function findFirstString(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
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

function extractPdfUrl(invoice: ExternalInvoice): string | null {
  return (
    findFirstString(
      invoice.invoice_url,
      invoice.receipt_url,
      invoice.document_url,
      invoice.documents?.[0]?.url,
      invoice.receipts?.[0]?.url,
      invoice.invoice?.pdf_url,
    ) ?? findFirstPdfLikeUrl(invoice)
  );
}

function storagePathForInvoice(
  invoiceId: string,
  externalInvoiceId?: string | null,
): string {
  const safeExternalId = (externalInvoiceId?.trim() || invoiceId).replace(
    /[^A-Za-z0-9_.-]+/g,
    "-",
  );
  return `revolut/${invoiceId}/${safeExternalId}.pdf`;
}

function isPdfResponse(response: Response): boolean {
  const contentType = response.headers.get("content-type")?.toLowerCase() || "";
  const disposition =
    response.headers.get("content-disposition")?.toLowerCase() || "";
  const url = response.url.toLowerCase();

  return (
    contentType.includes("application/pdf") ||
    disposition.includes(".pdf") ||
    url.includes(".pdf")
  );
}

function absoluteHttpUrl(baseUrl: string, href: string): string | null {
  const trimmed = href.trim();

  if (!trimmed || /^(javascript|mailto|tel):/i.test(trimmed)) {
    return null;
  }

  try {
    const url = new URL(trimmed, baseUrl);
    return /^https?:$/i.test(url.protocol) ? url.toString() : null;
  } catch {
    return null;
  }
}

function extractDownloadUrlFromHtml(
  html: string,
  baseUrl: string,
): string | null {
  const candidates: string[] = [];
  const attributePattern =
    /(?:href|src|data-url|data-href|download-url)=["']([^"']+)["']/gi;
  const scriptUrlPattern =
    /["']([^"']*(?:pdf|download|invoice|document|receipt)[^"']*)["']/gi;

  for (const match of html.matchAll(attributePattern)) {
    if (match[1]) {
      candidates.push(match[1]);
    }
  }

  for (const match of html.matchAll(scriptUrlPattern)) {
    if (match[1]) {
      candidates.push(match[1]);
    }
  }

  for (const candidate of candidates) {
    const lowerCandidate = candidate.toLowerCase();

    if (
      !lowerCandidate.includes("pdf") &&
      !lowerCandidate.includes("download") &&
      !lowerCandidate.includes("invoice") &&
      !lowerCandidate.includes("document") &&
      !lowerCandidate.includes("receipt")
    ) {
      continue;
    }

    const absoluteUrl = absoluteHttpUrl(baseUrl, candidate);
    if (absoluteUrl) {
      return absoluteUrl;
    }
  }

  return null;
}

async function fetchOfficialPdf(revolutPdfUrl: string): Promise<Response> {
  const merchantKey = process.env.REVOLUT_MERCHANT_API_KEY;
  const apiVersion =
    process.env.REVOLUT_MERCHANT_API_VERSION?.trim() || "2024-09-01";
  const headers: Record<string, string> = {
    Accept: "application/pdf,text/html;q=0.9,*/*;q=0.8",
    "Revolut-Api-Version": apiVersion,
  };

  if (merchantKey) {
    headers.Authorization = `Bearer ${merchantKey}`;
  }

  const initialResponse = await fetch(revolutPdfUrl, {
    headers,
    redirect: "follow",
  });

  if (!initialResponse.ok || isPdfResponse(initialResponse)) {
    return initialResponse;
  }

  const contentType = initialResponse.headers.get("content-type") || "";

  if (!/html|text\/plain/i.test(contentType)) {
    return initialResponse;
  }

  const html = await initialResponse.clone().text();
  const downloadUrl = extractDownloadUrlFromHtml(
    html,
    initialResponse.url || revolutPdfUrl,
  );

  if (!downloadUrl || downloadUrl === initialResponse.url) {
    return initialResponse;
  }

  return fetch(downloadUrl, { headers, redirect: "follow" });
}

type SyncedInvoiceRow = {
  id: string;
  external_invoice_id: string | null;
  revolut_pdf_url: string | null;
  revolut_pdf_storage_path: string | null;
};

async function storageObjectExists(
  supabase: SupabaseClient,
  storagePath: string,
): Promise<boolean> {
  const { data, error } = await supabase.storage
    .from(PDF_BUCKET)
    .download(storagePath);

  return !error && Boolean(data);
}

async function ensurePdfBucket(supabase: SupabaseClient): Promise<void> {
  const { data: bucket } = await supabase.storage.getBucket(PDF_BUCKET);

  if (bucket) {
    return;
  }

  const { error } = await supabase.storage.createBucket(PDF_BUCKET, {
    public: false,
  });

  if (error && !/already exists|already owned/i.test(error.message)) {
    throw new Error(`Supabase PDF bucket failed: ${error.message}`);
  }
}

async function cacheInvoicePdf(
  supabase: SupabaseClient,
  invoice: SyncedInvoiceRow,
): Promise<boolean> {
  if (!invoice.revolut_pdf_url) {
    return false;
  }

  const existingStoragePath = invoice.revolut_pdf_storage_path?.trim();
  if (
    existingStoragePath &&
    (await storageObjectExists(supabase, existingStoragePath))
  ) {
    return false;
  }

  const upstream = await fetchOfficialPdf(invoice.revolut_pdf_url);
  if (!upstream.ok || !isPdfResponse(upstream)) {
    throw new Error(`PDF fetch failed (${upstream.status})`);
  }

  const storagePath =
    existingStoragePath ||
    storagePathForInvoice(invoice.id, invoice.external_invoice_id);
  const bytes = Buffer.from(await upstream.arrayBuffer());
  const contentType = upstream.headers.get("content-type") || "application/pdf";
  await ensurePdfBucket(supabase);

  const { error: uploadError } = await supabase.storage
    .from(PDF_BUCKET)
    .upload(storagePath, bytes, {
      contentType,
      upsert: true,
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { error: updateError } = await supabase
    .from("invoices")
    .update({ revolut_pdf_storage_path: storagePath })
    .eq("id", invoice.id);

  if (updateError) {
    throw new Error(updateError.message);
  }

  return true;
}

function getCustomerName(
  customer?: string | RevolutCustomer,
  fallback?: string,
): string | null {
  if (fallback) return fallback;
  if (typeof customer === "string") return customer;
  if (customer?.full_name) return customer.full_name;
  return null;
}

function mapInvoiceStatus(status?: string): string {
  const s = (status ?? "").toLowerCase();

  if (s === "completed" || s === "paid") return "paid";
  if (s === "cancelled" || s === "canceled" || s === "failed")
    return "cancelled";
  if (s === "pending") return "issued";

  return "issued";
}

function mapPaymentStatus(status?: string): string {
  const s = (status ?? "").toLowerCase();

  if (s === "completed" || s === "paid") return "paid";
  if (s === "cancelled" || s === "canceled" || s === "failed") return "failed";
  if (s === "pending") return "unpaid";

  return "unpaid";
}

function parsePaymentLinkTitle(title?: string): {
  dog_names: string[];
  service_type: string | null;
  duration_minutes: number | null;
  day_count: number | null;
} {
  if (!title) {
    return {
      dog_names: [],
      service_type: null,
      duration_minutes: null,
      day_count: null,
    };
  }

  const parts = title
    .split("-")
    .map((s) => s.trim())
    .filter(Boolean);

  const dogNames = (parts[0] ?? "")
    .split("&")
    .map((s) => s.trim())
    .filter(Boolean);

  const serviceType = parts[1] ?? null;

  const minutesMatch = title.match(/(\d+)\s*min/i);
  const daysMatch = title.match(/(\d+)\s*day/i);

  return {
    dog_names: dogNames,
    service_type: serviceType,
    duration_minutes: minutesMatch ? Number(minutesMatch[1]) : null,
    day_count: daysMatch ? Number(daysMatch[1]) : null,
  };
}

function statusesMatch(
  invoiceStatus: string | null,
  linkStatus: string | null,
): boolean {
  if (!invoiceStatus || !linkStatus) return true;

  const invoicePaid = invoiceStatus === "paid";
  const linkPaid = linkStatus === "paid";

  if (invoicePaid && linkPaid) return true;
  if (!invoicePaid && !linkPaid) return true;

  return false;
}

async function loadInvoices(): Promise<ExternalInvoice[]> {
  const path = process.env.REVOLUT_INVOICES_PATH?.trim() || "/api/orders";

  const { status, data } = await revolutMerchantGet(path);

  if (status >= 400) {
    throw new Error(
      `Invoice fetch failed (${status}): ${JSON.stringify(data)}`,
    );
  }

  if (Array.isArray(data)) {
    return data as ExternalInvoice[];
  }

  if (Array.isArray((data as { invoices?: unknown[] })?.invoices)) {
    return (data as { invoices: ExternalInvoice[] }).invoices;
  }

  if (Array.isArray((data as { orders?: unknown[] })?.orders)) {
    return (data as { orders: ExternalInvoice[] }).orders;
  }

  return [];
}

async function fetchRevolutInvoiceDetails(
  externalInvoiceId: string,
): Promise<ExternalInvoice | null> {
  const invoicesPath =
    process.env.REVOLUT_INVOICES_PATH?.trim() || "/api/orders";
  const normalizedInvoicesPath = invoicesPath.replace(/\/+$/, "");
  const encodedId = encodeURIComponent(externalInvoiceId);

  const detailPaths = Array.from(
    new Set([
      `${normalizedInvoicesPath}/${encodedId}`,
      `/api/orders/${encodedId}`,
    ]),
  );

  for (const path of detailPaths) {
    const { status, data } = await revolutMerchantGet(path);

    if (status === 404) {
      continue;
    }

    if (status >= 400) {
      throw new Error(
        `Invoice detail fetch failed (${status}): ${JSON.stringify(data)}`,
      );
    }

    return data as ExternalInvoice;
  }

  return null;
}

async function loadPaymentLinks(): Promise<RevolutOrder[]> {
  const path = process.env.REVOLUT_PAYMENT_LINKS_PATH?.trim() || "/api/orders";

  const { status, data } = await revolutMerchantGet(path);

  if (status >= 400) {
    throw new Error(
      `Payment links fetch failed (${status}): ${JSON.stringify(data)}`,
    );
  }

  if (Array.isArray(data)) {
    return data as RevolutOrder[];
  }

  if (Array.isArray((data as { orders?: unknown[] })?.orders)) {
    return (data as { orders: RevolutOrder[] }).orders;
  }

  return [];
}

async function resolveClientIdByName(
  supabase: SupabaseClient,
  customerName: string | null,
): Promise<string | null> {
  if (!customerName) return null;

  const { data, error } = await supabase
    .from("clients")
    .select("id, full_name");

  if (error) throw new Error(error.message);

  const normalized = normalizeName(customerName);

  const exact = (data ?? []).find(
    (row) => normalizeName(String(row.full_name ?? "")) === normalized,
  );

  if (exact) return String(exact.id);

  const firstName = normalized.split(" ")[0];

  const firstMatches = (data ?? []).filter((row) => {
    const fullName = normalizeName(String(row.full_name ?? ""));
    return fullName.startsWith(`${firstName} `) || fullName === firstName;
  });

  if (firstMatches.length === 1) {
    return String(firstMatches[0].id);
  }

  return null;
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization") ?? "";

  if (authHeader !== `Bearer ${process.env.REVOLUT_SYNC_SECRET}`) {
    return NextResponse.json(
      { ok: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json(
      { ok: false, message: "Missing supabase env" },
      { status: 500 },
    );
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    const [extInvoices, extLinks] = await Promise.all([
      loadInvoices(),
      loadPaymentLinks(),
    ]);

    const invoiceRows: Array<Record<string, unknown>> = [];

    for (const invoice of extInvoices) {
      const customerName = getCustomerName(
        invoice.customer,
        invoice.customer_name,
      );

      const amountCents = toCents(invoice.total_amount ?? invoice.amount);

      const currency = (invoice.currency ?? "EUR").toUpperCase();

      const issuedAt = invoice.issued_at ?? invoice.created_at ?? null;

      const clientId = await resolveClientIdByName(supabase, customerName);
      let detailedInvoice: ExternalInvoice | null = null;
      let revolutPdfUrl = extractPdfUrl(invoice);

      if (!revolutPdfUrl) {
        detailedInvoice = await fetchRevolutInvoiceDetails(invoice.id);
        revolutPdfUrl = detailedInvoice ? extractPdfUrl(detailedInvoice) : null;
      }

      const revolutInvoiceNumber = findFirstString(
        invoice.number,
        invoice.invoice?.number,
        detailedInvoice?.number,
        detailedInvoice?.invoice?.number,
      );
      const revolutPublicUrl = findFirstString(
        invoice.public_url,
        invoice.payment_url,
        invoice.url,
        invoice.hosted_invoice_url,
        invoice.invoice?.public_url,
        detailedInvoice?.public_url,
        detailedInvoice?.payment_url,
        detailedInvoice?.url,
        detailedInvoice?.hosted_invoice_url,
        detailedInvoice?.invoice?.public_url,
      );

      invoiceRows.push({
        invoice_number: revolutInvoiceNumber ?? invoice.id,
        external_invoice_id: invoice.id,
        customer_name: customerName,
        client_id: clientId,
        amount_cents: amountCents,
        currency,
        status: mapInvoiceStatus(invoice.status ?? invoice.state),
        due_date: invoice.due_date ?? null,
        issued_at: issuedAt,
        revolut_invoice_number: revolutInvoiceNumber,
        revolut_pdf_url: revolutPdfUrl,
        revolut_public_url: revolutPublicUrl,
      });
    }

    let pdfsCached = 0;
    const pdfCacheFailures: Array<{ invoiceId: string; message: string }> = [];

    if (invoiceRows.length > 0) {
      const { data: syncedInvoices, error } = await supabase
        .from("invoices")
        .upsert(invoiceRows, {
          onConflict: "external_invoice_id",
        })
        .select(
          "id, external_invoice_id, revolut_pdf_url, revolut_pdf_storage_path",
        );

      if (error) {
        throw new Error(`Invoices upsert failed: ${error.message}`);
      }

      for (const invoice of (syncedInvoices ?? []) as SyncedInvoiceRow[]) {
        try {
          const cached = await cacheInvoicePdf(supabase, invoice);
          if (cached) {
            pdfsCached += 1;
          }
        } catch (pdfError) {
          pdfCacheFailures.push({
            invoiceId: invoice.id,
            message:
              pdfError instanceof Error ? pdfError.message : "PDF cache failed",
          });
        }
      }
    }

    const { data: dbInvoices, error: dbErr } = await supabase
      .from("invoices")
      .select("id, external_invoice_id, amount_cents, issued_at, status");

    if (dbErr) throw new Error(dbErr.message);

    const paymentRows: Array<Record<string, unknown>> = [];
    const invoicePublicUrlRows: Array<{
      id: string;
      revolut_public_url: string;
    }> = [];

    for (const link of extLinks) {
      const parsed = parsePaymentLinkTitle(link.description);

      const linkAmountCents = toCents(link.amount);

      const linkStatus = mapPaymentStatus(link.state);

      const createdAt = link.created_at ?? null;

      const candidates = (dbInvoices ?? [])
        .filter((inv) => {
          if (!inv.issued_at || !createdAt) return false;

          return (
            new Date(inv.issued_at).getTime() <=
              new Date(createdAt).getTime() &&
            Number(inv.amount_cents) === linkAmountCents
          );
        })
        .sort(
          (a, b) =>
            new Date(b.issued_at ?? 0).getTime() -
            new Date(a.issued_at ?? 0).getTime(),
        );

      const matched =
        candidates.find((candidate) =>
          statusesMatch(
            String(candidate.status ?? "").toLowerCase(),
            linkStatus,
          ),
        ) ??
        candidates[0] ??
        null;

      const linkUrl = link.token
        ? `https://checkout.revolut.com/payment-link/${link.token}`
        : "";

      if (matched?.id && linkUrl) {
        invoicePublicUrlRows.push({
          id: String(matched.id),
          revolut_public_url: linkUrl,
        });
      }

      paymentRows.push({
        invoice_id: matched?.id ?? null,
        provider: "revolut",
        provider_reference: link.id,
        url: linkUrl,
        status: linkStatus,
        created_at: createdAt,
        amount_cents: linkAmountCents,
        currency: (link.currency ?? "EUR").toUpperCase(),
        title: link.description ?? null,
        dog_names: parsed.dog_names,
        service_type: parsed.service_type,
        duration_minutes: parsed.duration_minutes,
        day_count: parsed.day_count,
        amount_matches_invoice: matched
          ? Number(matched.amount_cents) === linkAmountCents
          : false,
      });
    }

    if (paymentRows.length > 0) {
      const { error } = await supabase
        .from("payment_links")
        .upsert(paymentRows, {
          onConflict: "provider_reference",
        });

      if (error) {
        throw new Error(`Payment links upsert failed: ${error.message}`);
      }
    }

    const uniqueInvoicePublicUrlRows = Array.from(
      new Map(
        invoicePublicUrlRows.map((row) => [row.id, row.revolut_public_url]),
      ),
      ([id, revolut_public_url]) => ({ id, revolut_public_url }),
    );

    for (const row of uniqueInvoicePublicUrlRows) {
      const { error } = await supabase
        .from("invoices")
        .update({ revolut_public_url: row.revolut_public_url })
        .eq("id", row.id);

      if (error) {
        throw new Error(`Invoice public URL update failed: ${error.message}`);
      }
    }

    return NextResponse.json({
      ok: true,
      invoicesImported: invoiceRows.length,
      paymentLinksImported: paymentRows.length,
      pdfsCached,
      pdfCacheFailures,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sync failed";

    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
