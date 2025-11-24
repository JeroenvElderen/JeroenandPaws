const { createClient } = require("@supabase/supabase-js");
const crypto = require("crypto");
const { DateTime } = require("luxon");

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

let supabaseAdmin = null;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.warn(
    "Supabase admin client is missing configuration. Check NEXT_PUBLIC_SUPABASE_URL/SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
  );
} else {
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

const createConfigError = () => {
  const error = new Error(
    "Supabase admin client is not configured. Please set NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY."
  );
  error.statusCode = 503;
  error.publicMessage =
    "Bookings are temporarily unavailable. Please try again later.";
  return error;
};

const requireSupabase = () => {
  if (!supabaseAdmin) {
    throw createConfigError();
  }
};

const hashPassword = (value) =>
  crypto
    .createHash("sha256")
    .update(value || "")
    .digest("hex");

const findAuthUserByEmail = async (email) => {
  requireSupabase();

  const normalizedEmail = (email || "").trim().toLowerCase();
  if (!normalizedEmail) return null;

  const { data, error } = await supabaseAdmin.auth.admin.listUsers({
    email: normalizedEmail,
  });

  if (error) {
    throw error;
  }

  return data?.users?.[0] || null;
};

const ensureAuthUserWithPassword = async ({ email, password, fullName }) => {
  requireSupabase();

  const normalizedEmail = (email || "").trim().toLowerCase();
  if (!normalizedEmail || !password) return { user: null, created: false };

  const existingUser = await findAuthUserByEmail(normalizedEmail);

  if (existingUser) {
    const updateResult = await supabaseAdmin.auth.admin.updateUserById(
      existingUser.id,
      {
        password,
        user_metadata: fullName ? { full_name: fullName } : undefined,
      }
    );

    if (updateResult.error) {
      throw updateResult.error;
    }

    return { user: updateResult.data.user, created: false };
  }

  const createResult = await supabaseAdmin.auth.admin.createUser({
    email: normalizedEmail,
    password,
    email_confirm: true,
    user_metadata: fullName ? { full_name: fullName } : undefined,
  });

  if (createResult.error) {
    throw createResult.error;
  }

  return { user: createResult.data.user, created: true };
};

// Ensures there is a Supabase Auth user for the given email and then creates a
// matching row in the `clients` table using the Auth user's ID. If a client
// already exists for the normalized email, the existing row is returned
// without creating or updating Auth state.
const ensureClientProfile = async ({ email, fullName, phone }) => {
  requireSupabase();

  const normalizedEmail = (email || "").trim().toLowerCase();

  if (!normalizedEmail) {
    throw new Error("Client email is required to create a profile");
  }

  const existingClient = await supabaseAdmin
    .from("clients")
    .select("*")
    .ilike("email", normalizedEmail)
    .maybeSingle();

  if (existingClient.error) {
    throw existingClient.error;
  }

  if (existingClient.data) {
    return { client: existingClient.data, created: false };
  }

  const temporaryPassword = crypto.randomBytes(9).toString("base64");
  const passwordSetupToken = crypto.randomUUID();

  const { user: authUser } = await ensureAuthUserWithPassword({
    email: normalizedEmail,
    password: temporaryPassword,
    fullName,
  });

  const clientId = authUser?.id;

  if (!clientId) {
    throw new Error("Failed to ensure Supabase Auth user for client creation");
  }

  const insertResult = await supabaseAdmin
    .from("clients")
    .insert({
      id: clientId,
      email: normalizedEmail,
      full_name: fullName || null,
      phone_number: phone || null,
      hashed_password: hashPassword(temporaryPassword),
      password_setup_token: passwordSetupToken,
    })
    .select("*")
    .single();

  if (insertResult.error) {
    // Gracefully handle race conditions or case-only email differences that can
    // happen when a client already exists with the same email.
    if (insertResult.error.code === "23505") {
      const conflict = await supabaseAdmin
        .from("clients")
        .select("*")
        .ilike("email", normalizedEmail)
        .maybeSingle();

      if (conflict.error) {
        throw conflict.error;
      }

      if (conflict.data) {
        return { client: conflict.data, created: false };
      }
    }
    
    throw insertResult.error;
  }

  return {
    client: insertResult.data,
    created: true,
    temporaryPassword,
  };
};

const hasPetDetails = (pet = {}) => {
  const name = (pet.name || "").trim();
  const breed = (pet.breed || "").trim();
  const notes = (pet.notes || "").trim();
  const photo = pet.photoDataUrl || pet.photo_data_url;

  return Boolean(name || breed || notes || photo);
};

const ensurePetProfiles = async (clientId, pets = []) => {
  requireSupabase();

  if (!clientId) return [];

  const ensuredPets = [];

  for (const pet of pets) {
    if (!pet) continue;

    if (pet?.id) {
      const existing = await supabaseAdmin
        .from("pets")
        .select("*")
        .eq("id", pet.id)
        .eq("owner_id", clientId)
        .maybeSingle();

      if (existing.error) {
        throw existing.error;
      }

      if (existing.data) {
        ensuredPets.push(existing.data);
        continue;
      }
    }

    const insertResult = await supabaseAdmin
      .from("pets")
      .insert({
        owner_id: clientId,
        name: pet?.name || "New pet",
        breed: pet?.breed || null,
        notes: pet?.notes || null,
        photo_data_url: pet?.photoDataUrl || null,
      })
      .select("*")
      .single();

    if (insertResult.error) {
      throw insertResult.error;
    }

    ensuredPets.push(insertResult.data);
  }

  return ensuredPets;
};

const saveBookingCalendarEventId = async (bookingId, calendarEventId) => {
  requireSupabase();

  if (!bookingId || !calendarEventId) return null;

  const updateResult = await supabaseAdmin
    .from("bookings")
    .update({ calendar_event_id: calendarEventId })
    .eq("id", bookingId)
    .select("id, calendar_event_id")
    .maybeSingle();

  if (updateResult.error) {
    throw updateResult.error;
  }

  return updateResult.data;
};

const looksLikeUuid = (value) =>
  typeof value === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

const getServiceByIdentifier = async (serviceIdOrSlug) => {
  requireSupabase();

  if (!serviceIdOrSlug) return null;

  const isUuid = looksLikeUuid(serviceIdOrSlug);

  const query = supabaseAdmin.from("services_catalog").select("*");

  const result = isUuid
    ? await query.eq("id", serviceIdOrSlug).maybeSingle()
    : await query.eq("slug", serviceIdOrSlug).maybeSingle();

  if (result.error) {
    if (result.error.code === "PGRST116") {
      return null;
    }
    throw result.error;
  }

  return result.data;
};

const createBookingRecord = async ({
  clientId,
  serviceId,
  serviceTitle,
  start,
  end,
  timeZone,
  notes,
}) => {
  requireSupabase();

  const insertResult = await supabaseAdmin
    .from("bookings")
    .insert({
      client_id: clientId,
      service_id: serviceId || null,
      service_title: serviceTitle || null,
      start_at: start.toUTC().toISO(),
      end_at: end.toUTC().toISO(),
      time_zone: timeZone || "UTC",
      notes: notes || null,
      status: "pending",
    })
    .select("*")
    .single();

  if (insertResult.error) {
    throw insertResult.error;
  }

  return insertResult.data;
};

const linkBookingPets = async (bookingId, pets) => {
  requireSupabase();

  if (!bookingId || pets.length === 0) return [];

  const records = pets.map((pet) => ({
    booking_id: bookingId,
    pet_id: pet.id,
  }));

  const insertResult = await supabaseAdmin
    .from("booking_pets")
    .insert(records)
    .select("*");

  if (insertResult.error) {
    throw insertResult.error;
  }

  return insertResult.data;
};

const deleteBookingById = async (bookingId) => {
  requireSupabase();

  if (!bookingId) return null;

  const deleteResult = await supabaseAdmin
    .from("bookings")
    .delete()
    .eq("id", bookingId)
    .select("*")
    .maybeSingle();

  if (deleteResult.error) {
    throw deleteResult.error;
  }

  return deleteResult.data;
};

const createBookingWithProfiles = async ({
  date,
  time,
  durationMinutes = 60,
  serviceId,
  serviceTitle,
  timeZone = "UTC",
  clientName,
  clientEmail,
  notes,
  pets = [],
  dogCount,
}) => {
  requireSupabase();

  const service = await getServiceByIdentifier(serviceId);
  const duration = Number.isFinite(durationMinutes)
    ? durationMinutes
    : service?.duration_minutes || 60;

  const start = DateTime.fromISO(`${date}T${time}`, {
    zone: timeZone || "UTC",
  });
  const safeStart = start.isValid
    ? start
    : DateTime.fromISO(`${date}T${time}`, { zone: "UTC" });
  const end = safeStart.plus({ minutes: duration });

  // The client profile call will create or update the Supabase Auth user first
  // and then insert the `clients` row using the Auth user's ID so both records
  // share the same identifier.
  const { client, created, temporaryPassword } = await ensureClientProfile({
    email: clientEmail,
    fullName: clientName,
  });

  const ensuredPets = await ensurePetProfiles(client.id, pets);

  const booking = await createBookingRecord({
    clientId: client.id,
    serviceId: service?.id || null,
    serviceTitle: service?.title || serviceTitle,
    start: safeStart,
    end,
    timeZone,
    notes,
  });

  await linkBookingPets(booking.id, ensuredPets);

  return {
    booking,
    client,
    pets: ensuredPets,
    service,
    passwordDelivery: created
      ? {
          temporaryPassword,
          passwordSetupToken: client.password_setup_token,
        }
      : null,
    totals: {
      requestedDogCount: dogCount,
      storedPetCount: ensuredPets.length,
    },
  };
};

module.exports = {
  createBookingWithProfiles,
  saveBookingCalendarEventId,
  ensureClientProfile,
  ensurePetProfiles,
  getServiceByIdentifier,
  ensureAuthUserWithPassword,
  findAuthUserByEmail,
  hashPassword,
  deleteBookingById,
  supabaseAdmin,
  requireSupabase,
};
