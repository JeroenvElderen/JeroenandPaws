import AsyncStorage from "@react-native-async-storage/async-storage";

const ACTIVE_CARDS_PREFIX = "jeroenpaws:active_cards:";

const getStorageKey = (ownerEmail) =>
  `${ACTIVE_CARDS_PREFIX}${(ownerEmail || "").toLowerCase()}`;

const safeParse = (value) => {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (error) {
    return {};
  }
};

export const loadActiveCards = async (ownerEmail) => {
  if (!ownerEmail) return {};
  try {
    const raw = await AsyncStorage.getItem(getStorageKey(ownerEmail));
    return safeParse(raw);
  } catch (error) {
    console.warn("Failed to load active card state", error);
    return {};
  }
};

export const saveActiveCards = async (ownerEmail, activeCards) => {
  if (!ownerEmail) return;
  try {
    await AsyncStorage.setItem(
      getStorageKey(ownerEmail),
      JSON.stringify(activeCards || {})
    );
  } catch (error) {
    console.warn("Failed to persist active card state", error);
  }
};

export const clearActiveCard = async (ownerEmail, bookingId) => {
  if (!ownerEmail || !bookingId) return;
  try {
    const raw = await AsyncStorage.getItem(getStorageKey(ownerEmail));
    const parsed = safeParse(raw);
    if (!parsed[bookingId]) return;
    const next = { ...parsed };
    delete next[bookingId];
    await AsyncStorage.setItem(getStorageKey(ownerEmail), JSON.stringify(next));
  } catch (error) {
    console.warn("Failed to clear active card state", error);
  }
};