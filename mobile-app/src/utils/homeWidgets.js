import AsyncStorage from "@react-native-async-storage/async-storage";

const normalizeProfileId = (profileId) =>
  (profileId || "").toString().trim().toLowerCase();

const getStorageKey = (email, profileId) => {
  const baseKey = `home-widgets:${(email || "").trim().toLowerCase()}`;
  const normalizedProfileId = normalizeProfileId(profileId);
  if (!normalizedProfileId) {
    return baseKey;
  }
  return `${baseKey}:${normalizedProfileId}`;
};

export const DEFAULT_HOME_LAYOUT = {
  widgetIds: [],
  sectionIds: [],
  customWidgets: [],
  headerStyle: "classic",
};

export const loadHomeLayout = async (
  email,
  fallback = DEFAULT_HOME_LAYOUT,
  profileId
) => {
  if (!email) return fallback;
  try {
    const raw = await AsyncStorage.getItem(getStorageKey(email, profileId));
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return {
        ...fallback,
        widgetIds: parsed,
      };
    }
    return {
      ...fallback,
      ...(parsed || {}),
    };
  } catch (error) {
    console.warn("Unable to read widget preferences", error);
    return fallback;
  }
};

export const saveHomeLayout = async (email, layout, profileId) => {
  if (!email) return;
  const payload = {
    ...DEFAULT_HOME_LAYOUT,
    ...(layout || {}),
  };
  try {
    await AsyncStorage.setItem(
      getStorageKey(email, profileId),
      JSON.stringify(payload)
    );
  } catch (error) {
    console.warn("Unable to save widget preferences", error);
  }
};