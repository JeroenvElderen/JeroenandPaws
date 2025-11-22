const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
const { DateTime } = require('luxon');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.warn('Supabase admin client is missing configuration. Check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const hashPassword = (value) =>
  crypto.createHash('sha256').update(value || '').digest('hex');

const ensureClientProfile = async ({ email, fullName, phone }) => {
  const normalizedEmail = (email || '').trim().toLowerCase();

  if (!normalizedEmail) {
    throw new Error('Client email is required to create a profile');
  }

  const existingClient = await supabaseAdmin
    .from('clients')
    .select('*')
    .eq('email', normalizedEmail)
    .maybeSingle();

  if (existingClient.error) {
    throw existingClient.error;
  }

  if (existingClient.data) {
    return { client: existingClient.data, created: false };
  }

  const temporaryPassword = crypto.randomBytes(9).toString('base64');
  const passwordSetupToken = crypto.randomUUID();

  const insertResult = await supabaseAdmin
    .from('clients')
    .insert({
      email: normalizedEmail,
      full_name: fullName || null,
      phone_number: phone || null,
      hashed_password: hashPassword(temporaryPassword),
      password_setup_token: passwordSetupToken,
    })
    .select('*')
    .single();

  if (insertResult.error) {
    throw insertResult.error;
  }

  return {
    client: insertResult.data,
    created: true,
    temporaryPassword,
  };
};

const ensurePetProfiles = async (clientId, pets = []) => {
  if (!clientId) return [];

  const ensuredPets = [];

  for (const pet of pets) {
    if (pet?.id) {
      const existing = await supabaseAdmin
        .from('pets')
        .select('*')
        .eq('id', pet.id)
        .eq('owner_id', clientId)
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
      .from('pets')
      .insert({
        owner_id: clientId,
        name: pet?.name || 'New pet',
        breed: pet?.breed || null,
        notes: pet?.notes || null,
        photo_data_url: pet?.photoDataUrl || null,
      })
      .select('*')
      .single();

    if (insertResult.error) {
      throw insertResult.error;
    }

    ensuredPets.push(insertResult.data);
  }

  return ensuredPets;
};

const getServiceByIdentifier = async (serviceIdOrSlug) => {
  if (!serviceIdOrSlug) return null;

  const query = supabaseAdmin
    .from('services_catalog')
    .select('*')
    .or(`id.eq.${serviceIdOrSlug},slug.eq.${serviceIdOrSlug}`)
    .limit(1);

  const result = await query.single();

  if (result.error) {
    if (result.error.code === 'PGRST116') {
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
  const insertResult = await supabaseAdmin
    .from('bookings')
    .insert({
      client_id: clientId,
      service_id: serviceId || null,
      service_title: serviceTitle || null,
      start_at: start.toUTC().toISO(),
      end_at: end.toUTC().toISO(),
      time_zone: timeZone || 'UTC',
      notes: notes || null,
    })
    .select('*')
    .single();

  if (insertResult.error) {
    throw insertResult.error;
  }

  return insertResult.data;
};

const linkBookingPets = async (bookingId, pets) => {
  if (!bookingId || pets.length === 0) return [];

  const records = pets.map((pet) => ({
    booking_id: bookingId,
    pet_id: pet.id,
  }));

  const insertResult = await supabaseAdmin
    .from('booking_pets')
    .insert(records)
    .select('*');

  if (insertResult.error) {
    throw insertResult.error;
  }

  return insertResult.data;
};

const createBookingWithProfiles = async ({
  date,
  time,
  durationMinutes = 60,
  serviceId,
  serviceTitle,
  timeZone = 'UTC',
  clientName,
  clientEmail,
  notes,
  pets = [],
  dogCount,
}) => {
  const service = await getServiceByIdentifier(serviceId);
  const duration = Number.isFinite(durationMinutes)
    ? durationMinutes
    : service?.duration_minutes || 60;

  const start = DateTime.fromISO(`${date}T${time}`, { zone: timeZone || 'UTC' });
  const safeStart = start.isValid ? start : DateTime.fromISO(`${date}T${time}`, { zone: 'UTC' });
  const end = safeStart.plus({ minutes: duration });

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
  ensureClientProfile,
  ensurePetProfiles,
  getServiceByIdentifier,
  supabaseAdmin,
};