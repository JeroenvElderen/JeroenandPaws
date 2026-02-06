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
    title: { fontSize: 28, fontWeight: "700", letterSpacing: 0.3 },
    headline: { fontSize: 20, fontWeight: "700", letterSpacing: 0.2 },
    body: { fontSize: 15, fontWeight: "500", letterSpacing: 0.2 },
    caption: { fontSize: 13, fontWeight: "500", letterSpacing: 0.2 },
  },
  shadow: {
    soft: {
      shadowColor: "#000000",
      shadowOpacity: 0.18,
      shadowOffset: { width: 0, height: 10 },
      shadowRadius: 18,
      elevation: 6,
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
  background: "#f7f5fb",
  surface: "#ffffff",
  surfaceElevated: "#f0ecf9",
  surfaceAccent: "#ebe6f7",
  border: "#e1d8f3",
  borderStrong: "#cbb9ee",
  textPrimary: "#1f1733",
  textSecondary: "#5f5676",
  textMuted: "#8b7ca8",
  accent: "#8f2bff",
  accentSoft: "#b083ff",
  success: "#2ecc71",
  danger: "#d33a3a",
  white: "#ffffff",
};

const darkColors = {
  background: "#0b0818",
  surface: "#141024",
  surfaceElevated: "#1a1530",
  surfaceAccent: "#20183d",
  border: "#261c44",
  borderStrong: "#3b2a66",
  textPrimary: "#f7f5ff",
  textSecondary: "#c9c5d8",
  textMuted: "#8b7ca8",
  accent: "#8f2bff",
  accentSoft: "#b083ff",
  success: "#2ecc71",
  danger: "#d33a3a",
  white: "#ffffff",
};

export const createTheme = (mode = THEME_MODES.light) => ({
  colors: mode === THEME_MODES.light ? lightColors : darkColors,
  ...baseTokens,
});
