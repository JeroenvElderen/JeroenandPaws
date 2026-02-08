import Constants from "expo-constants";

const extraConfig =
  Constants.expoConfig?.extra ??
  Constants.manifest?.extra ??
  Constants.manifest2?.extra ??
  {};

export const API_BASE_URL =
  extraConfig.apiBaseUrl ||
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  "https://jeroenandpaws.com";