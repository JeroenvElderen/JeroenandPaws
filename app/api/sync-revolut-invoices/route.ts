import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';
import { revolutMerchantGet } from '@/lib/revolut/proxy';

export const runtime = 'nodejs';

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
  if (typeof amount !== 'number' || Number.isNaN(amount)) return 0;
  return Math.round(amount);
}

function normalizeName(v: string): string {
  return v.trim().toLowerCase().replace(/\s+/g, ' ');
}

function getCustomerName(
  customer?: string | RevolutCustomer,
  fallback?: string
): string | null {
  if (fallback) return fallback;
  if (typeof customer === 'string') return customer;
  if (customer?.full_name) return customer.full_name;
  return null;
}

function mapInvoiceStatus(status?: string): string {
  const s = (status ?? '').toLowerCase();

  if (s === 'completed' || s === 'paid') return 'paid';
  if (s === 'cancelled' || s === 'canceled' || s === 'failed') return 'cancelled';
  if (s === 'pending') return 'issued';

  return 'issued';
}

function mapPaymentStatus(status?: string): string {
  const s = (status ?? '').toLowerCase();

  if (s === 'completed' || s === 'paid') return 'paid';
  if (s === 'cancelled' || s === 'canceled' || s === 'failed') return 'failed';
  if (s === 'pending') return 'unpaid';

  return 'unpaid';
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
      day_count: null
    };
  }

  const parts = title.split('-').map((s) => s.trim()).filter(Boolean);

  const dogNames = (parts[0] ?? '')
    .split('&')
    .map((s) => s.trim())
    .filter(Boolean);

  const serviceType = parts[1] ?? null;

  const minutesMatch = title.match(/(\d+)\s*min/i);
  const daysMatch = title.match(/(\d+)\s*day/i);

  return {
    dog_names: dogNames,
    service_type: serviceType,
    duration_minutes: minutesMatch ? Number(minutesMatch[1]) : null,
    day_count: daysMatch ? Number(daysMatch[1]) : null
  };
}

function statusesMatch(
  invoiceStatus: string | null,
  linkStatus: string | null
): boolean {
  if (!invoiceStatus || !linkStatus) return true;

  const invoicePaid = invoiceStatus === 'paid';
  const linkPaid = linkStatus === 'paid';

  if (invoicePaid && linkPaid) return true;
  if (!invoicePaid && !linkPaid) return true;

  return false;
}

async function loadInvoices(): Promise<ExternalInvoice[]> {
  const path =
    process.env.REVOLUT_INVOICES_PATH?.trim() || '/api/orders';

  const { status, data } = await revolutMerchantGet(path);

  if (status >= 400) {
    throw new Error(
      `Invoice fetch failed (${status}): ${JSON.stringify(data)}`
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

async function loadPaymentLinks(): Promise<RevolutOrder[]> {
  const path =
    process.env.REVOLUT_PAYMENT_LINKS_PATH?.trim() || '/api/orders';

  const { status, data } = await revolutMerchantGet(path);

  if (status >= 400) {
    throw new Error(
      `Payment links fetch failed (${status}): ${JSON.stringify(data)}`
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
  customerName: string | null
): Promise<string | null> {
  if (!customerName) return null;

  const { data, error } = await supabase
    .from('clients')
    .select('id, full_name');

  if (error) throw new Error(error.message);

  const normalized = normalizeName(customerName);

  const exact = (data ?? []).find(
    (row) =>
      normalizeName(String(row.full_name ?? '')) === normalized
  );

  if (exact) return String(exact.id);

  const firstName = normalized.split(' ')[0];

  const firstMatches = (data ?? []).filter((row) => {
    const fullName = normalizeName(String(row.full_name ?? ''));
    return fullName.startsWith(`${firstName} `) || fullName === firstName;
  });

  if (firstMatches.length === 1) {
    return String(firstMatches[0].id);
  }

  return null;
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization') ?? '';

  if (authHeader !== `Bearer ${process.env.REVOLUT_SYNC_SECRET}`) {
    return NextResponse.json(
      { ok: false, message: 'Unauthorized' },
      { status: 401 }
    );
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json(
      { ok: false, message: 'Missing supabase env' },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    const [extInvoices, extLinks] = await Promise.all([
      loadInvoices(),
      loadPaymentLinks()
    ]);

    const invoiceRows: Array<Record<string, unknown>> = [];

    for (const invoice of extInvoices) {
      const customerName = getCustomerName(
        invoice.customer,
        invoice.customer_name
      );

      const amountCents = toCents(
        invoice.total_amount ?? invoice.amount
      );

      const currency = (invoice.currency ?? 'EUR').toUpperCase();

      const issuedAt =
        invoice.issued_at ?? invoice.created_at ?? null;

      const clientId = await resolveClientIdByName(
        supabase,
        customerName
      );

      invoiceRows.push({
        invoice_number: invoice.number ?? invoice.id,
        external_invoice_id: invoice.id,
        customer_name: customerName,
        client_id: clientId,
        amount_cents: amountCents,
        currency,
        status: mapInvoiceStatus(
          invoice.status ?? invoice.state
        ),
        due_date: invoice.due_date ?? null,
        issued_at: issuedAt
      });
    }

    if (invoiceRows.length > 0) {
      const { error } = await supabase
        .from('invoices')
        .upsert(invoiceRows, {
          onConflict: 'external_invoice_id'
        });

      if (error) {
        throw new Error(
          `Invoices upsert failed: ${error.message}`
        );
      }
    }

    const { data: dbInvoices, error: dbErr } = await supabase
      .from('invoices')
      .select(
        'id, external_invoice_id, amount_cents, issued_at, status'
      );

    if (dbErr) throw new Error(dbErr.message);

    const paymentRows: Array<Record<string, unknown>> = [];

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
            new Date(a.issued_at ?? 0).getTime()
        );

      const matched =
        candidates.find((candidate) =>
          statusesMatch(
            String(candidate.status ?? '').toLowerCase(),
            linkStatus
          )
        ) ??
        candidates[0] ??
        null;

      paymentRows.push({
        invoice_id: matched?.id ?? null,
        provider: 'revolut',
        provider_reference: link.id,
        url: link.token
          ? `https://checkout.revolut.com/payment-link/${link.token}`
          : '',
        status: linkStatus,
        created_at: createdAt,
        amount_cents: linkAmountCents,
        currency: (link.currency ?? 'EUR').toUpperCase(),
        title: link.description ?? null,
        dog_names: parsed.dog_names,
        service_type: parsed.service_type,
        duration_minutes: parsed.duration_minutes,
        day_count: parsed.day_count,
        amount_matches_invoice: matched
          ? Number(matched.amount_cents) === linkAmountCents
          : false
      });
    }

    if (paymentRows.length > 0) {
      const { error } = await supabase
        .from('payment_links')
        .upsert(paymentRows, {
          onConflict: 'provider_reference'
        });

      if (error) {
        throw new Error(
          `Payment links upsert failed: ${error.message}`
        );
      }
    }

    return NextResponse.json({
      ok: true,
      invoicesImported: invoiceRows.length,
      paymentLinksImported: paymentRows.length
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Sync failed';

    return NextResponse.json(
      { ok: false, message },
      { status: 500 }
    );
  }
}