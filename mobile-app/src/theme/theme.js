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
      shadowOpacity: 0.14,
      shadowOffset: { width: 0, height: 10 },
      shadowRadius: 16,
      elevation: 6,
    },
    lift: {
      shadowColor: "#000000",
      shadowOpacity: 0.18,
      shadowOffset: { width: 0, height: 14 },
      shadowRadius: 22,
      elevation: 8,
    },
    glow: {
      shadowColor: "#8f2bff",
      shadowOpacity: 0.2,
      shadowOffset: { width: 0, height: 8 },
      shadowRadius: 14,
      elevation: 5,
    },
  },
};

const lightColors = {
  background: "#f3edff",
  surface: "#ffffff",
  surfaceElevated: "#efe6ff",
  surfaceAccent: "#e3d6ff",
  surfaceGlass: "rgba(247, 241, 255, 0.88)",
  border: "#d4c4ff",
  borderStrong: "#b7a0ff",
  borderSoft: "#efe8ff",
  textPrimary: "#140c2b",
  textSecondary: "#3a2c5c",
  textMuted: "#574272",
  accent: "#6b2de3",
  accentSoft: "#b18cff",
  accentDeep: "#4d1ab3",
  accentMuted: "#efe6ff",
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

const lightShadow = {
  soft: {
    ...baseTokens.shadow.soft,
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 3,
  },
  lift: {
    ...baseTokens.shadow.lift,
    shadowOpacity: 0.16,
    shadowRadius: 20,
    elevation: 6,
  },
  glow: {
    ...baseTokens.shadow.glow,
    shadowOpacity: 0.14,
    shadowRadius: 12,
    elevation: 4,
  },
};

export const createTheme = (mode = THEME_MODES.light) => ({
  colors: mode === THEME_MODES.light ? lightColors : darkColors,
  ...baseTokens,
  shadow: mode === THEME_MODES.light ? lightShadow : baseTokens.shadow,
});
