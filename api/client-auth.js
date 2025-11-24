const { supabaseAdmin, requireSupabase } = require("./_lib/supabase");
const { reconcileBookingsWithCalendar } = require('./_lib/bookings');

const normalizeEmail = (value = "") => (value || "").trim().toLowerCase();

const buildProfile = async (clientId) => {
  const clientResult = await supabaseAdmin
    .from("clients")
    .select("*")
    .eq("id", clientId)
    .single();

  if (clientResult.error) throw clientResult.error;

  const petsResult = await supabaseAdmin
    .from("pets")
    .select("*")
    .eq("owner_id", clientId)
    .order("created_at", { ascending: false });

  if (petsResult.error) throw petsResult.error;

  const bookingsResult = await supabaseAdmin
    .from("bookings")
    .select("*, services_catalog(*), booking_pets(pet_id)")
    .eq("client_id", clientId)
    .order("start_at", { ascending: false });

  if (bookingsResult.error) throw bookingsResult.error;

  const reconciledBookings = await reconcileBookingsWithCalendar(
    bookingsResult.data || []
  );

  return {
    client: clientResult.data,
    pets: petsResult.data || [],
    bookings: reconciledBookings,
  };
};

module.exports = async (req, res) => {
  if (req.method === "POST") {
    // LOGIN
    try {
      requireSupabase();

      const body = req.body || {};
      const email = normalizeEmail(body.email);
      const password = body.password || "";

      if (!email || !password) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ message: "Email and password are required." }));
      }

      // 🔥 Login using Supabase Auth
      const { data, error } = await supabaseAdmin.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Supabase Auth login error:", error);
        res.statusCode = 401;
        return res.end(JSON.stringify({ message: "Incorrect email or password." }));
      }

      const user = data?.user;

      if (!user) {
        res.statusCode = 401;
        return res.end(JSON.stringify({ message: "Login failed." }));
      }

      // 🔥 Then load your custom profile from DB (clients table)
      const profile = await buildProfile(user.id);

      res.setHeader("Content-Type", "application/json");
      return res.end(JSON.stringify(profile));

    } catch (error) {
      console.error("Client auth error", error);
      res.statusCode = 500;
      return res.end(JSON.stringify({ message: "Unable to authenticate." }));
    }
  }

  if (req.method === "PUT") {
    // (Optional) Initial password setup if needed
    res.statusCode = 410;
    res.end(JSON.stringify({ message: "Password setup via API is disabled. Use password reset." }));
    return;
  }

  res.statusCode = 405;
  res.setHeader("Allow", "POST");
  res.end("Method Not Allowed");
};
