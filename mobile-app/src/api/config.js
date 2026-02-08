import Constants from "expo-constants";

const extraConfig =
  Constants.expoConfig?.extra ??
  Constants.manifest?.extra ??
  Constants.manifest2?.extra ??
  {};

const resolvedApiBaseUrl =
  extraConfig.apiBaseUrl ||
  extraConfig.API_BASE_URL ||
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  process.env.API_BASE_URL ||
  "https:www//jeroenandpaws.com";

if (typeof __DEV__ !== "undefined" && __DEV__) {
  const source =
    extraConfig.apiBaseUrl
      ? "expo.extra.apiBaseUrl"
      : extraConfig.API_BASE_URL
        ? "expo.extra.API_BASE_URL"
        : process.env.EXPO_PUBLIC_API_BASE_URL
          ? "process.env.EXPO_PUBLIC_API_BASE_URL"
          : process.env.API_BASE_URL
            ? "process.env.API_BASE_URL"
            : "fallback";
  console.info("[api] API_BASE_URL resolved", {
    source,
    value: resolvedApiBaseUrl,
    extraKeys: Object.keys(extraConfig || {}),
    hasExpoConfig: Boolean(Constants.expoConfig),
    hasManifest: Boolean(Constants.manifest || Constants.manifest2),
  });
}

export const API_BASE_URL = resolvedApiBaseUrl;