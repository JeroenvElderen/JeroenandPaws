import { supabase } from "../../lib/supabase";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("service_addons")
      .select("*")
      .order("sort_order");

    if (error) return res.status(500).json({ error: error.message });

    res.json({ addons: data });
  }

  if (req.method === "POST") {
    const { addon } = req.body;
    const { data, error } = await supabase
      .from("service_addons")
      .upsert(addon)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });

    res.json({ addon: data });
  }
}