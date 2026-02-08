export const THEME_MODES = {
  light: "light",
  dark: "dark",
};

const baseTokens = {
  spacing: {
    xs: 6,
    sm: 10,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
  },
  radius: {
    sm: 12,
    md: 16,
    lg: 20,
    xl: 28,
    pill: 999,
  },
  typography: {
    display: { fontSize: 34, fontWeight: "700", letterSpacing: 0.4 },
    title: { fontSize: 28, fontWeight: "700", letterSpacing: 0.3 },
    headline: { fontSize: 20, fontWeight: "700", letterSpacing: 0.2 },
    body: { fontSize: 15, fontWeight: "500", letterSpacing: 0.2 },
    caption: { fontSize: 13, fontWeight: "500", letterSpacing: 0.2 },
    overline: { fontSize: 11, fontWeight: "600", letterSpacing: 0.6 },
  },
  shadow: {
    soft: {
      shadowColor: "#000000",
      shadowOpacity: 0.18,
      shadowOffset: { width: 0, height: 10 },
      shadowRadius: 18,
      elevation: 6,
    },
    lift: {
      shadowColor: "#000000",
      shadowOpacity: 0.22,
      shadowOffset: { width: 0, height: 14 },
      shadowRadius: 26,
      elevation: 10,
    },
    glow: {
      shadowColor: "#8f2bff",
      shadowOpacity: 0.2,
      shadowOffset: { width: 0, height: 8 },
      shadowRadius: 16,
      elevation: 6,
    },
  },
};

const lightColors = {
  background: "#f9fafb",
  surface: "#ffffff",
  surfaceElevated: "#f2f0ff",
  surfaceAccent: "#e7e3ff",
  surfaceGlass: "rgba(255, 255, 255, 0.72)",
  border: "#e4d5f4",
  borderStrong: "#cdb5ee",
  borderSoft: "#f2e9fb",
  border: "#e5e1f0",
  borderStrong: "#c7bddc",
  borderSoft: "#f0ecf7",
  textPrimary: "#1f1a2b",
  textSecondary: "#4f465f",
  textMuted: "#7a6d8f",
  accent: "#7b3ff2",
  accentSoft: "#9a6bff",
  accentDeep: "#5e24d9",
  accentMuted: "#e7dbff",
  success: "#2ecc71",
  danger: "#d33a3a",
  white: "#ffffff",
};

const darkColors = {
  background: "#120a1f",
  surface: "#1a122b",
  surfaceElevated: "#221739",
  surfaceAccent: "#2b1d48",
  surfaceGlass: "rgba(26, 18, 43, 0.78)",
  border: "#2f214a",
  borderStrong: "#46306b",
  borderSoft: "#2a1f44",
  textPrimary: "#f6f2ff",
  textSecondary: "#d0c6e0",
  textMuted: "#9a8db3",
  accent: "#b57bff",
  accentSoft: "#cfa7ff",
  accentDeep: "#8b4dff",
  accentMuted: "#3c2a5f",
  success: "#2ecc71",
  danger: "#d33a3a",
  white: "#ffffff",
};

export const createTheme = (mode = THEME_MODES.light) => ({
  colors: mode === THEME_MODES.light ? lightColors : darkColors,
  ...baseTokens,
});
