import { supabaseAdmin } from "./supabase";
import { DateTime } from "luxon";

export async function generateInvoiceNumber() {
  const year = DateTime.now().toFormat("yyyy");

  const { data, error } = await supabaseAdmin
    .from("bookings")
    .select("invoice_number")
    .like("invoice_number", `JPAWS-${year}-%`);

  if (error) throw error;

  const next = String((data?.length || 0) + 1).padStart(4, "0");
  return `JPAWS-${year}-${next}`;
}
