const { createClient } = require("@supabase/supabase-js");
const crypto = require("crypto");
const { DateTime } = require("luxon");

const BUSINESS_TIME_ZONE = "Europe/Dublin";

const PET_PHOTO_BUCKET =
  process.env.SUPABASE_PET_PHOTO_BUCKET || "pet-photos";

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

const parseDataUrlImage = (dataUrl = "") => {
  if (typeof dataUrl !== "string" || !dataUrl.startsWith("data:")) {
    return null;
  }

  const matches = dataUrl.match(/^data:([^;]+);base64,(.*)$/);
  if (!matches || matches.length < 3) return null;

  const contentType = matches[1];
  const base64Data = matches[2];

  if (!contentType || !base64Data) return null;

  return { contentType, buffer: Buffer.from(base64Data, "base64") };
};

const buildPublicStoragePrefix = () =>
  `${supabaseUrl}/storage/v1/object/public/${PET_PHOTO_BUCKET}/`;

const extractStoragePath = (publicUrl = "") => {
  const prefix = buildPublicStoragePrefix();
  if (typeof publicUrl !== "string") return null;

  return publicUrl.startsWith(prefix)
    ? publicUrl.slice(prefix.length)
    : publicUrl.startsWith("public/")
    ? publicUrl.replace(/^public\//, "")
    : null;
};

const createSignedPetPhotoUrl = async (publicUrl) => {
  requireSupabase();

  if (!publicUrl) return null;

  const storagePath = extractStoragePath(publicUrl);
  if (!storagePath) return publicUrl;

  const { data, error } = await supabaseAdmin.storage
    .from(PET_PHOTO_BUCKET)
    .createSignedUrl(storagePath, 60 * 60 * 24 * 14);

  if (error) {
    console.error("Failed to create signed pet photo URL", error);
    return publicUrl;
  }

  return data?.signedUrl || publicUrl;
};

const deletePetPhotoFromStorage = async (publicUrlOrPath) => {
  requireSupabase();

  const storagePath = extractStoragePath(publicUrlOrPath);
  if (!storagePath) return null;

  const { error } = await supabaseAdmin.storage
    .from(PET_PHOTO_BUCKET)
    .remove([storagePath]);

  if (error) {
    console.error("Failed to delete pet photo", error);
    return null;
  }

  return storagePath;
};

const uploadPetPhoto = async ({ dataUrl, fileName, clientId, replace }) => {
  requireSupabase();

  const parsed = parseDataUrlImage(dataUrl);
  if (!parsed) return { publicUrl: null, storagePath: null };

  const extension = parsed.contentType.split("/")[1] || "jpg";
  const sanitizedName = (fileName || "pet").replace(/[^a-z0-9.\-]+/gi, "-");
  const uniqueName = `${Date.now()}-${sanitizedName || "photo"}.${extension}`;
  const path = clientId
    ? `clients/${clientId}/pets/${uniqueName}`
    : `pets/${uniqueName}`;

  const { data, error } = await supabaseAdmin.storage
    .from(PET_PHOTO_BUCKET)
    .upload(path, parsed.buffer, {
      contentType: parsed.contentType,
      upsert: Boolean(replace),
    });

  if (error) {
    throw error;
  }

  const { data: publicData } = supabaseAdmin.storage
    .from(PET_PHOTO_BUCKET)
    .getPublicUrl(data?.path || path);

  return { publicUrl: publicData?.publicUrl || null, storagePath: data?.path || path };
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

const resolveBookingTimes = ({
  date,
  time,
  durationMinutes = 60,
  timeZone = BUSINESS_TIME_ZONE,
}) => {
  const start = DateTime.fromISO(`${date}T${time}`, {
    zone: timeZone || BUSINESS_TIME_ZONE,
  });
  const safeStart = start.isValid
    ? start
    : DateTime.fromISO(`${date}T${time}`, { zone: BUSINESS_TIME_ZONE });
  const end = safeStart.plus({ minutes: durationMinutes });

  return { start: safeStart, end };
};

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
const ensureClientProfile = async ({ email, fullName, phone, address }) => {
  requireSupabase();

  const normalizedEmail = (email || "").trim().toLowerCase();
  const phoneToStore = (phone || "").trim();
  const addressToStore = (address || "").trim();

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
    const needsUpdate =
      (phoneToStore && existingClient.data.phone_number !== phoneToStore) ||
      (addressToStore && existingClient.data.address !== addressToStore);

    if (needsUpdate) {
      const updateResult = await supabaseAdmin
        .from("clients")
        .update({
          phone_number: phoneToStore || existingClient.data.phone_number,
          address: addressToStore || existingClient.data.address,
        })
        .eq("id", existingClient.data.id)
        .select("*")
        .maybeSingle();

      if (updateResult.error) {
        throw updateResult.error;
      }

      return { client: updateResult.data, created: false };
    }

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
      phone_number: phoneToStore || null,
      address: addressToStore || null,
      hashed_password: hashPassword(temporaryPassword),
      password_setup_token: passwordSetupToken,
    })
    .select("*")
    .single();

  if (insertResult.error) {
    // Gracefully handle race conditions or case-only email differences that can
    // happen when a client already exists with the same email.
    if (insertResult.error.code === "23505") {
      const conflictByEmail = await supabaseAdmin
        .from("clients")
        .select("*")
        .ilike("email", normalizedEmail)
        .maybeSingle();

      if (conflictByEmail.error) {
        throw conflictByEmail.error;
      }

      if (conflictByEmail.data) {
        return { client: conflictByEmail.data, created: false };
      }

      // Fallback to checking by the Auth user ID in case the conflict was
      // caused by a primary key collision rather than the email column.
      const conflictById = await supabaseAdmin
        .from("clients")
        .select("*")
        .eq("id", clientId)
        .maybeSingle();

      if (conflictById.error) {
        throw conflictById.error;
      }

      if (conflictById.data) {
        return { client: conflictById.data, created: false };
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

const findAdjacentBookings = async ({ start, end, excludeBookingId }) => {
  requireSupabase();

  let previousQuery = supabaseAdmin
    .from("bookings")
    .select("id, start_at, end_at, client_address")
    .lt("end_at", start)
    .not("status", "in", "(cancelled,canceled)")
    .order("end_at", { ascending: false })
    .limit(1);

  if (excludeBookingId) {
    previousQuery = previousQuery.neq("id", excludeBookingId);
  }

  const { data: previous, error: previousError } = await previousQuery.maybeSingle();

  if (previousError) {
    throw previousError;
  }

  let nextQuery = supabaseAdmin
    .from("bookings")
    .select("id, start_at, end_at, client_address")
    .gt("start_at", end)
    .not("status", "in", "(cancelled,canceled)")
    .order("start_at", { ascending: true })
    .limit(1);

  if (excludeBookingId) {
    nextQuery = nextQuery.neq("id", excludeBookingId);
  }

  const { data: next, error: nextError } = await nextQuery.maybeSingle();

  if (nextError) {
    throw nextError;
  }

  return { previous: previous || null, next: next || null };
};

const hasPetDetails = (pet = {}) => {
  const name = (pet.name || "").trim();
  const breed = (pet.breed || "").trim();
  const notes = (pet.notes || "").trim();
  const photo = pet.photoDataUrl || pet.photo_data_url;

  return Boolean(name || breed || notes || photo);
};

const ensurePetProfiles = async (
  clientId,
  pets = [],
  { allowNewPetCreation = true } = {}
) => {
  requireSupabase();

  if (!clientId) return [];

  const ensuredPets = [];

  for (const pet of pets) {
    if (!pet) continue;

    const hasDetails = hasPetDetails(pet);

    const normalizedName = (pet?.name || "").trim();

    const resolvedExisting = pet?.id
      ? await supabaseAdmin
          .from("pets")
          .select("*")
          .eq("id", pet.id)
          .eq("owner_id", clientId)
          .maybeSingle()
      : normalizedName
      ? await supabaseAdmin
          .from("pets")
          .select("*")
          .ilike("name", normalizedName)
          .eq("owner_id", clientId)
          .maybeSingle()
      : null;

    if (resolvedExisting?.error) {
      throw resolvedExisting.error;
    }

    if (resolvedExisting?.data) {
      const existingPet = resolvedExisting.data;
      const hasIncomingPhoto = parseDataUrlImage(
        pet.photoDataUrl || pet.photo_data_url
      );
      const shouldUpdate = hasPetDetails(pet) || hasIncomingPhoto;      

      if (!shouldUpdate) {
        ensuredPets.push(existingPet);
        continue;
      }

      let nextPhotoUrl = existingPet.photo_data_url;

      if (hasIncomingPhoto) {
        const uploadResult = await uploadPetPhoto({
          dataUrl: pet.photoDataUrl || pet.photo_data_url,
          fileName: pet.photoName,
          clientId,
          replace: true,
        });

        nextPhotoUrl = uploadResult.publicUrl || nextPhotoUrl;

        if (uploadResult.publicUrl && existingPet.photo_data_url) {
          await deletePetPhotoFromStorage(existingPet.photo_data_url);
        }
      }

      const updateResult = await supabaseAdmin
        .from("pets")
        .update({
          name: pet?.name || existingPet.name || "New pet",
          breed: pet?.breed || existingPet.breed || null,
          notes: pet?.notes || existingPet.notes || null,
          photo_data_url: nextPhotoUrl || null,
        })
        .eq("id", existingPet.id)
        .eq("owner_id", clientId)
        .select("*")
        .single();

      if (updateResult.error) {
        throw updateResult.error;
      }

      ensuredPets.push(updateResult.data);
      continue;
    }

    if (!allowNewPetCreation || !hasDetails) {
      continue;
    }

    let uploadedPhotoUrl = null;

    if (parseDataUrlImage(pet.photoDataUrl || pet.photo_data_url)) {
      const uploadResult = await uploadPetPhoto({
        dataUrl: pet.photoDataUrl || pet.photo_data_url,
        fileName: pet.photoName,
        clientId,
      });

      uploadedPhotoUrl = uploadResult.publicUrl;
    }

    const insertResult = await supabaseAdmin
      .from("pets")
      .insert({
        owner_id: clientId,
        name: pet?.name || "New pet",
        breed: pet?.breed || null,
        notes: pet?.notes || null,
        photo_data_url: uploadedPhotoUrl,
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
  clientAddress,
  notes,
  paymentOrderId,
  paymentLink,
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
      time_zone: timeZone || BUSINESS_TIME_ZONE,
      client_address: clientAddress || null,
      notes: notes || null,
      status: "pending",
      payment_order_id: paymentOrderId || null,
      payment_link: paymentLink || null,
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
  timeZone = BUSINESS_TIME_ZONE,
  clientName,
  clientPhone,
  clientAddress,
  clientEmail,
  notes,
  pets = [],
  dogCount,
  paymentOrderId,
  paymentLink,
}) => {
  requireSupabase();

  const service = await getServiceByIdentifier(serviceId);
  const duration = Number.isFinite(durationMinutes)
    ? durationMinutes
    : service?.duration_minutes || 60;

  const { start: safeStart, end } = resolveBookingTimes({
    date,
    time,
    durationMinutes: duration,
    timeZone,
  });

  // The client profile call will create or update the Supabase Auth user first
  // and then insert the `clients` row using the Auth user's ID so both records
  // share the same identifier.
  const { client, created, temporaryPassword } = await ensureClientProfile({
    email: clientEmail,
    fullName: clientName,
    phone: clientPhone,
    address: clientAddress,
  });

  const ensuredPets = await ensurePetProfiles(client.id, pets, {
    allowNewPetCreation: created,
  });

  const booking = await createBookingRecord({
    clientId: client.id,
    serviceId: service?.id || null,
    serviceTitle: service?.title || serviceTitle,
    start: safeStart,
    end,
    timeZone,
    clientAddress,
    notes,
    paymentOrderId,
    paymentLink,
  });

  await linkBookingPets(booking.id, ensuredPets);

  return {
    booking,
    client: { ...client, address: clientAddress || client.address },
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
  resolveBookingTimes,
  findAdjacentBookings,
  ensureAuthUserWithPassword,
  findAuthUserByEmail,
  hashPassword,
  deleteBookingById,
  uploadPetPhoto,
  deletePetPhotoFromStorage,
  createSignedPetPhotoUrl,
  supabaseAdmin,
  requireSupabase,
};
