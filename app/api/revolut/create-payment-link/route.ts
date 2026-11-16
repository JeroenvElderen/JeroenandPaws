import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";

export const runtime = "nodejs";

function authorized(request: NextRequest): boolean {
  const secret = process.env.SHORTCUTS_PAYMENT_API_SECRET;
  const provided = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  if (!secret || !provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Apple Shortcuts calls this endpoint with:
 * { "amount": 8400, "currency": "EUR",
 *   "description": "Nola - Dog Walking - 60min - 3 Days" }
 *
 * Amount is in minor units (cents). Client pricing, calendar parsing,
 * weekly grouping and WhatsApp delivery all stay in Apple Shortcuts.
 */
export async function POST(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return NextResponse.json({ error: "Expected a JSON object" }, { status: 400 });
  }
  const body = input as Record<string, unknown>;
  const amount = body.amount;
  const description = body.description;
  const currency = body.currency ?? "EUR";

  if (!Number.isSafeInteger(amount) || (amount as number) < 1 || (amount as number) > 1_000_000) {
    return NextResponse.json({ error: "amount must be an integer from 1 to 1000000 cents" }, { status: 400 });
  }
  if (currency !== "EUR") {
    return NextResponse.json({ error: "Only EUR is supported" }, { status: 400 });
  }
  if (typeof description !== "string" || description.trim().length < 5 || description.length > 255) {
    return NextResponse.json({ error: "description must contain 5–255 characters" }, { status: 400 });
  }

  const apiKey = process.env.REVOLUT_MERCHANT_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Revolut Merchant API is not configured" }, { status: 503 });
  }

  const base = process.env.REVOLUT_MERCHANT_BASE_URL?.trim() || "https://merchant.revolut.com";
  const version = process.env.REVOLUT_MERCHANT_API_VERSION?.trim() || "2024-09-01";

  try {
    const url = new URL("/api/orders", base);
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Revolut-Api-Version": version,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        amount,
        currency,
        description: description.trim(),
      }),
      cache: "no-store",
    });
    const result = (await response.json().catch(() => ({}))) as {
      id?: string;
      token?: string;
      checkout_url?: string;
      state?: string;
    };

    if (!response.ok) {
      return NextResponse.json(
        { error: "Revolut could not create the payment order", status: response.status },
        { status: 502 },
      );
    }

    // Merchant orders normally return a checkout_url. Do not invent one
    // if this merchant account/API version omits it.
    if (!result.id || !result.checkout_url) {
      return NextResponse.json(
        { error: "Revolut order created but checkout URL was missing; check the order in Revolut before retrying", order_id: result.id ?? null },
        { status: 502 },
      );
    }

    return NextResponse.json({
      order_id: result.id,
      payment_url: result.checkout_url,
      amount,
      currency,
      description: description.trim(),
      status: result.state ?? "pending",
    });
  } catch {
    return NextResponse.json({ error: "Revolut request failed; check Revolut before retrying" }, { status: 502 });
  }
}
