import AsyncStorage from "@react-native-async-storage/async-storage";

export const PENDING_PAYMENT_KEY = "jeroenpaws:pendingPayment";
export const PAYMENT_REMINDER_ID_KEY = "jeroenpaws:paymentReminderId";

export const savePendingPayment = async (payload) => {
  if (!payload) return;
  const record = {
    payload,
    savedAt: new Date().toISOString(),
  };
  await AsyncStorage.setItem(PENDING_PAYMENT_KEY, JSON.stringify(record));
};

export const getPendingPayment = async () => {
  const raw = await AsyncStorage.getItem(PENDING_PAYMENT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (error) {
    console.warn("Failed to parse pending payment payload", error);
    return null;
  }
};

export const clearPendingPayment = async () => {
  await AsyncStorage.removeItem(PENDING_PAYMENT_KEY);
};

export const storePaymentReminderId = async (id) => {
  if (!id) return;
  await AsyncStorage.setItem(PAYMENT_REMINDER_ID_KEY, id);
};

export const getPaymentReminderId = async () =>
  AsyncStorage.getItem(PAYMENT_REMINDER_ID_KEY);

export const clearPaymentReminderId = async () => {
  await AsyncStorage.removeItem(PAYMENT_REMINDER_ID_KEY);
};