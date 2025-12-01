const { supabaseAdmin } = require("./_lib/supabase");

module.exports = async (req, res) => {
  if (!res || typeof res.setHeader !== "function") {
    throw new Error("Invalid response object passed to addons handler");
  }

  if (req.method === "GET") {
    const { data, error } = await supabaseAdmin
      .from("service_addons")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Failed to load add-ons", error);
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ message: "Could not load add-ons" }));
      return;
    }

    const normalized = (data || []).map((addon) => ({
      ...addon,
      value: addon.value || addon.id,
    }));

    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ addons: normalized }));
    return;
  }

  if (req.method === "POST") {
    const { addon } = req.body || {};
    const { data, error } = await supabaseAdmin
      .from("service_addons")
      .upsert(addon)
      .select()
      .single();

    if (error) {
      console.error("Failed to save add-on", error);
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ message: "Could not save add-on" }));
      return;
    }

    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ addon: data }));
    return;
  }

  res.statusCode = 405;
  res.setHeader("Allow", "GET, POST");
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ message: "Method Not Allowed" }));
};