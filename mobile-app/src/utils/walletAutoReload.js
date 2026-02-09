import AsyncStorage from "@react-native-async-storage/async-storage";

const getStorageKey = (clientId) => `wallet-auto-reload:${clientId || ""}`;

export const DEFAULT_AUTO_RELOAD = {
  enabled: false,
  threshold_cents: 1500,
  top_up_cents: 5000,
  payment_method_label: "Primary card",
};

export const loadAutoReloadSettings = async (clientId) => {
  if (!clientId) return DEFAULT_AUTO_RELOAD;
  try {
    const raw = await AsyncStorage.getItem(getStorageKey(clientId));
    if (!raw) return DEFAULT_AUTO_RELOAD;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_AUTO_RELOAD,
      ...(parsed || {}),
    };
  } catch (error) {
    console.warn("Unable to read auto-reload settings", error);
    return DEFAULT_AUTO_RELOAD;
  }
};

export const saveAutoReloadSettings = async (clientId, settings) => {
  if (!clientId) return;
  try {
    await AsyncStorage.setItem(
      getStorageKey(clientId),
      JSON.stringify(settings)
    );
  } catch (error) {
    console.warn("Unable to save auto-reload settings", error);
  }
};