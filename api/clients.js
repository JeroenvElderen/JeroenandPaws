const {
  supabaseAdmin,
  ensureClientProfile,
  ensureAuthUserWithPassword,
  hashPassword,
  requireSupabase,
} = require("./_lib/supabase");

module.exports = async (req, res) => {
  if (req.method === "GET") {
    const email = (req.query.email || "").toLowerCase();
    const password = req.query.password;

    if (!email || !password) {
      res.statusCode = 400;
      res.end(JSON.stringify({ message: "Email and password are required" }));
      return;
    }

    const clientResult = await supabaseAdmin
      .from("clients")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (clientResult.error) {
      res.statusCode = 500;
      res.end(JSON.stringify({ message: "Failed to load client" }));
      return;
    }

    if (!clientResult.data) {
      res.statusCode = 404;
      res.end(JSON.stringify({ message: "Client not found" }));
      return;
    }

    if (!clientResult.data.hashed_password) {
      res.statusCode = 403;
      res.end(
        JSON.stringify({
          message: "Please set your password to access your profile.",
        })
      );
      return;
    }

    if (hashPassword(password) !== clientResult.data.hashed_password) {
      res.statusCode = 401;
      res.end(JSON.stringify({ message: "Invalid password" }));
      return;
    }

    const petsResult = await supabaseAdmin
      .from("pets")
      .select("*")
      .eq("owner_id", clientResult.data.id)
      .order("created_at", { ascending: false });

    const bookingsResult = await supabaseAdmin
      .from("bookings")
      .select("*, services_catalog(*), booking_pets(pet_id)")
      .eq("client_id", clientResult.data.id)
      .order("start_at", { ascending: false });

    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        client: clientResult.data,
        pets: petsResult.data || [],
        bookings: bookingsResult.data || [],
      })
    );
    return;
  }

  if (req.method === "POST") {
    try {
      const body = req.body || {};
      const { email, fullName, phone } = body;

      const result = await ensureClientProfile({
        email,
        fullName,
        phone,
      });

      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(result));
      return;
    } catch (error) {
      console.error("Client upsert error", error);
      res.statusCode = 500;
      res.end(JSON.stringify({ message: "Failed to upsert client" }));
      return;
    }
  }

  if (req.method === "PATCH") {
    try {
      requireSupabase();

      const { id, email, fullName, phone, newEmail } = req.body || {};
      const normalizedEmail = (email || newEmail || "").toLowerCase();

      if (!id && !normalizedEmail) {
        res.statusCode = 400;
        res.end(JSON.stringify({ message: "Client id or email is required" }));
        return;
      }

      const clientLookup = await supabaseAdmin
        .from("clients")
        .select("*")
        .eq(id ? "id" : "email", id || normalizedEmail)
        .maybeSingle();

      if (clientLookup.error) {
        res.statusCode = 500;
        res.end(JSON.stringify({ message: "Failed to load client" }));
        return;
      }

      const existingClient = clientLookup.data;

      if (!existingClient) {
        res.statusCode = 404;
        res.end(JSON.stringify({ message: "Client not found" }));
        return;
      }

      const nextEmail = (newEmail || existingClient.email || "").toLowerCase();

      const updateResult = await supabaseAdmin
        .from("clients")
        .update({
          full_name: fullName ?? existingClient.full_name,
          phone_number: phone ?? existingClient.phone_number,
          email: nextEmail,
        })
        .eq("id", existingClient.id)
        .select("*")
        .single();

      if (updateResult.error) {
        res.statusCode = 500;
        res.end(JSON.stringify({ message: "Failed to update client" }));
        return;
      }

      try {
        await supabaseAdmin.auth.admin.updateUserById(existingClient.id, {
          email: nextEmail,
          user_metadata: updateResult.data.full_name
            ? { full_name: updateResult.data.full_name }
            : undefined,
        });
      } catch (authError) {
        console.error("Failed to sync client profile to Supabase Auth", authError);
      }

      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ client: updateResult.data }));
      return;
    } catch (error) {
      console.error("Client update error", error);
      res.statusCode = error?.statusCode || 500;
      res.end(JSON.stringify({ message: error?.publicMessage || "Failed to update client" }));
      return;
    }
  }

  if (req.method === "PUT") {
    const { email, password } = req.body || {};
    const normalizedEmail = (email || "").toLowerCase();

    if (!normalizedEmail || !password) {
      res.statusCode = 400;
      res.end(JSON.stringify({ message: "Email and password are required" }));
      return;
    }

    if (password.length < 8) {
      res.statusCode = 400;
      res.end(
        JSON.stringify({
          message: "Password must be at least 8 characters long",
        })
      );
      return;
    }

    const clientResult = await supabaseAdmin
      .from("clients")
      .select("*")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (clientResult.error) {
      res.statusCode = 500;
      res.end(JSON.stringify({ message: "Failed to load client" }));
      return;
    }

    if (!clientResult.data) {
      res.statusCode = 404;
      res.end(JSON.stringify({ message: "Client not found" }));
      return;
    }

    const updateResult = await supabaseAdmin
      .from("clients")
      .update({
        hashed_password: hashPassword(password),
        password_setup_token: null,
      })
      .eq("id", clientResult.data.id)
      .select("*")
      .single();

    if (updateResult.error) {
      res.statusCode = 500;
      res.end(JSON.stringify({ message: "Failed to update password" }));
      return;
    }

    try {
      await ensureAuthUserWithPassword({
        email: normalizedEmail,
        password,
        fullName: updateResult.data.full_name,
      });
    } catch (authError) {
      console.error("Failed to sync password to Supabase Auth", authError);
    }

    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({ message: "Password updated", client: updateResult.data })
    );
    return;
  }

  res.statusCode = 405;
  res.setHeader("Allow", "GET, POST, PATCH, PUT");
  res.end("Method Not Allowed");
};
