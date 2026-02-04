export const buildSessionPayload = ({ user, client, fallback = {} }) => {
  const name =
    client?.full_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "";
  const normalizedEmail = (
    user?.email ||
    client?.email ||
    fallback.email ||
    ""
  )
    .trim()
    .toLowerCase();

  return {
    id: user?.id || client?.id,
    email: normalizedEmail,
    name,
    phone:
      client?.phone_number || user?.user_metadata?.phone || fallback.phone || "",
    address:
      client?.address || user?.user_metadata?.address || fallback.address || "",
    user,
    client,
  };
};

export const resolveClientProfile = async ({
  supabase,
  user,
  fallback = {},
}) => {
  if (!supabase || !user?.id) return null;

  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (data) {
    return data;
  }

  const clientPayload = {
    id: user.id,
    email: (user.email || fallback.email || "").trim().toLowerCase(),
    full_name: user?.user_metadata?.full_name || fallback.fullName || "",
    phone_number: user?.user_metadata?.phone || fallback.phone || "",
    address: user?.user_metadata?.address || fallback.address || "",
    notification_preferences:
      user?.user_metadata?.notification_preferences || null,
    expo_push_token: user?.user_metadata?.expo_push_token || null,
  };

  const upsertResult = await supabase
    .from("clients")
    .upsert(clientPayload, { onConflict: "id" })
    .select("*")
    .maybeSingle();

  if (upsertResult.error) {
    throw upsertResult.error;
  }

  return upsertResult.data || null;
};