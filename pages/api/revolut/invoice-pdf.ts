import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import PDFDocument from 'pdfkit';
import { revolutMerchantGet } from '../../../lib/revolut/proxy';

type InvoiceDetails = {
  orderId: string;
  status: string;
  amountCents: number | null;
  currency: string;
  createdAt: string;
  completedAt: string;
  customerName: string;
  customerEmail: string;
  description: string;
  merchantReference: string;
  dogNames: string;
  notes: string;
  dueDate: string;
  items: Array<{ label: string; amountCents: number | null }>;
};

const dash = (value: unknown): string => {
  if (value === null || value === undefined) return '-';
  const text = String(value).trim();
  return text.length ? text : '-';
};

const isValidOrderId = (value: string): boolean => /^[A-Za-z0-9_\-]{6,128}$/.test(value);

function findFirstString(...values: unknown[]): string {
  for (const v of values) {
    if (typeof v === 'string' && v.trim()) return v;
  }
  return '-';
}

function centsFromUnknown(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return Math.round(value);
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return Math.round(parsed);
  }
  return null;
}

function parseDate(value: unknown): string {
  if (typeof value !== 'string' || !value.trim()) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toISOString();
}

async function getSupabaseContext(orderId: string, customerName: string, metadata: Record<string, unknown>) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return { invoice: null as any, client: null as any, dogs: [] as any[] };
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  let invoice = null as any;
  const invoiceFields = 'id, invoice_number, external_invoice_id, amount_cents, currency, status, due_date, issued_at, customer_name, notes';
  const invoiceQueries = [
    supabase.from('invoices').select(invoiceFields).eq('external_invoice_id', orderId).maybeSingle(),
    supabase.from('invoices').select(invoiceFields).eq('invoice_number', orderId).maybeSingle(),
    supabase.from('invoices').select(invoiceFields).eq('id', orderId).maybeSingle()
  ];

  for (const query of invoiceQueries) {
    const { data } = await query;
    if (data) {
      invoice = data;
      break;
    }
  }

  const matchedCustomerName = findFirstString(invoice?.customer_name, customerName);
  const { data: clients } = await supabase.from('clients').select('id, full_name').ilike('full_name', matchedCustomerName);
  const client = (clients ?? [])[0] ?? null;

  let dogs: Array<{ name: string; client_id: string }> = [];
  if (client?.id) {
    const dogRes = await supabase.from('dogs').select('name, client_id').eq('client_id', client.id);
    dogs = (dogRes.data as Array<{ name: string; client_id: string }>) ?? [];
  }

  if (dogs.length === 0 && typeof metadata.dog_names === 'string') {
    dogs = String(metadata.dog_names)
      .split(',')
      .map((name) => name.trim())
      .filter(Boolean)
      .map((name) => ({ name, client_id: client?.id ?? '-' }));
  }

  return { invoice, client, dogs };
}

function createPdfBuffer(details: InvoiceDetails): Promise<Buffer> {
  return new Promise((resolve) => {
    const doc: any = new PDFDocument({ margin: 40 });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    doc.on('end', () => resolve(Buffer.concat(chunks)));

    const currency = details.currency || 'EUR';
    const money = (cents: number | null) => (typeof cents === 'number' ? `${(cents / 100).toFixed(2)} ${currency}` : '-');

    doc.fontSize(22).text('Invoice Details');
    doc.moveDown(0.8);
    doc.fontSize(12);
    const fields: Array<[string, string]> = [
      ['Status', dash(details.status)],
      ['Invoice/Order ID', dash(details.orderId)],
      ['Issue Date', dash(details.createdAt)],
      ['Due Date', dash(details.dueDate)],
      ['Currency', dash(details.currency)],
      ['Customer Name', dash(details.customerName)],
      ['Dogs', dash(details.dogNames)],
      ['Customer Email', dash(details.customerEmail)],
      ['Description', dash(details.description)],
      ['Merchant Reference', dash(details.merchantReference)]
    ];

    fields.forEach(([label, value]) => {
      doc.font('Helvetica-Bold').text(`${label}: `, { continued: true });
      doc.font('Helvetica').text(value);
    });

    doc.moveDown().font('Helvetica-Bold').text('Invoice Items');
    doc.moveDown(0.4);
    details.items.forEach((item) => {
      doc.font('Helvetica').text(`• ${dash(item.label)} — ${money(item.amountCents)}`);
    });

    const subtotal = typeof details.amountCents === 'number' ? details.amountCents : details.items.reduce((sum, item) => sum + (item.amountCents ?? 0), 0);
    const total = subtotal;

    doc.moveDown();
    doc.font('Helvetica-Bold').text(`Subtotal: ${money(subtotal)}`);
    doc.font('Helvetica-Bold').text(`Tax (0%): ${money(0)}`);
    doc.font('Helvetica-Bold').text(`Total: ${money(total)}`);

    doc.moveDown();
    doc.font('Helvetica-Bold').text('Notes');
    doc.font('Helvetica').text(dash(details.notes));

    doc.end();
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const orderId = typeof req.query.orderId === 'string' ? req.query.orderId.trim() : '';
    if (!orderId || !isValidOrderId(orderId)) {
      return res.status(400).json({ error: 'Invalid orderId' });
    }

    const { status, data } = await revolutMerchantGet(`/api/orders/${encodeURIComponent(orderId)}`);
    if (status >= 400 || !data) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = data?.order ?? data;
    const metadata = (order?.metadata ?? {}) as Record<string, unknown>;

    const documentUrl = findFirstString(
      order?.invoice_url,
      order?.receipt_url,
      order?.document_url,
      order?.documents?.[0]?.url,
      order?.receipts?.[0]?.url,
      order?.invoice?.pdf_url
    );

    if (documentUrl !== '-' && /^https?:\/\//i.test(documentUrl)) {
      const merchantKey = process.env.REVOLUT_MERCHANT_API_KEY;
      const apiVersion = process.env.REVOLUT_MERCHANT_API_VERSION?.trim() || '2024-09-01';
      const upstream = await fetch(documentUrl, {
        headers: {
          Authorization: `Bearer ${merchantKey}`,
          'Revolut-Api-Version': apiVersion
        }
      });
      if (upstream.ok) {
        const bytes = Buffer.from(await upstream.arrayBuffer());
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="invoice-${orderId}.pdf"`);
        return res.status(200).send(bytes);
      }
    }

    const customerName = findFirstString(order?.customer?.name, metadata.customer_name, metadata.client_name);
    const supabaseContext = await getSupabaseContext(orderId, customerName, metadata);
    const description = findFirstString(order?.description, metadata.description);

    const rawItems = Array.isArray(order?.line_items)
      ? order.line_items
      : Array.isArray(order?.items)
        ? order.items
        : Array.isArray(metadata?.invoice_items)
          ? metadata.invoice_items
          : [];

    const items = rawItems.length
      ? rawItems.map((item: any) => ({
          label: findFirstString(item?.name, item?.description, item?.label),
          amountCents: centsFromUnknown(item?.amount ?? item?.amount_cents ?? item?.total_amount)
        }))
      : [{ label: description, amountCents: centsFromUnknown(order?.amount) }];

    const dogNames = supabaseContext.dogs.length > 0
      ? supabaseContext.dogs.map((dog) => dog.name).join(', ')
      : findFirstString(metadata.dog_names);

    const details: InvoiceDetails = {
      orderId,
      status: findFirstString(order?.state, order?.status, supabaseContext.invoice?.status),
      amountCents: centsFromUnknown(order?.amount ?? order?.order_amount ?? supabaseContext.invoice?.amount_cents),
      currency: findFirstString(order?.currency, supabaseContext.invoice?.currency, 'EUR'),
      createdAt: parseDate(order?.created_at ?? order?.created),
      completedAt: parseDate(order?.completed_at ?? order?.paid_at),
      customerName: findFirstString(customerName, supabaseContext.invoice?.customer_name, supabaseContext.client?.full_name),
      customerEmail: findFirstString(order?.customer?.email, metadata.customer_email, metadata.email),
      description,
      merchantReference: findFirstString(order?.merchant_order_ref, order?.merchant_order_reference, metadata.merchant_order_reference),
      dogNames,
      notes: findFirstString(metadata.notes, metadata.note, supabaseContext.invoice?.notes),
      dueDate: findFirstString(parseDate(supabaseContext.invoice?.due_date), parseDate(metadata.due_date)),
      items
    };

    const pdf = await createPdfBuffer(details);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${orderId}.pdf"`);
    return res.status(200).send(pdf);
  } catch {
    return res.status(500).json({ error: 'Failed to generate invoice PDF' });
  }
}