// pages/api/payment-status.js
import { supabase } from "./_lib/supabase";


export default async function handler(req, res) {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: "Missing id" });

  const { data, error } = await supabase
    .from("bookings")
    .select("payment_status")
    .eq("id", id)
    .single();

  if (error || !data)
    return res.status(404).json({ error: "Not found" });

  res.status(200).json(data);
}
