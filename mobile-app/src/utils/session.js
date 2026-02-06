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
      client?.phone_number ||
      user?.user_metadata?.phone ||
      fallback.phone ||
      "",
    address:
      client?.address ||
      user?.user_metadata?.address ||
      fallback.address ||
      "",
    user,
    client,
  };
};

export const resolveClientProfile = async ({
  supabase,
  user,
}) => {
  if (!supabase || !user?.id) return null;

  // small retry loop to handle slight trigger delay
  const waitForClientRow = async ({
    attempts = 5,
    delayMs = 400,
  } = {}) => {
    for (let i = 0; i < attempts; i += 1) {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (error) throw error;
      if (data) return data;

      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }

    return null;
  };

  const client = await waitForClientRow();

  if (!client) {
    throw new Error(
      "Your account was created, but we could not load your profile. Please try logging in again."
    );
  }

  return client;
};
