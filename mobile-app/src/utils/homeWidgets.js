import AsyncStorage from "@react-native-async-storage/async-storage";

const getStorageKey = (email) =>
  `home-widgets:${(email || "").trim().toLowerCase()}`;

export const DEFAULT_HOME_LAYOUT = {
  widgetIds: [],
  sectionIds: [],
  customWidgets: [],
  headerStyle: "classic",
};

export const loadHomeLayout = async (email, fallback = DEFAULT_HOME_LAYOUT) => {
  if (!email) return fallback;
  try {
    const raw = await AsyncStorage.getItem(getStorageKey(email));
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

export const saveHomeLayout = async (email, layout) => {
  if (!email) return;
  const payload = {
    ...DEFAULT_HOME_LAYOUT,
    ...(layout || {}),
  };
  try {
    await AsyncStorage.setItem(
      getStorageKey(email),
      JSON.stringify(payload)
    );
  } catch (error) {
    console.warn("Unable to save widget preferences", error);
  }
};