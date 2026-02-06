import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Appearance } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createTheme, THEME_MODES } from "../theme/theme";
export { THEME_MODES };


const THEME_STORAGE_KEY = "jeroenpaws:themeMode";
const THEME_PREFERENCE_KEY = "jeroenpaws:themePreference";

export const THEME_PREFERENCES = {
  system: "system",
  manual: "manual",
};

export const ThemeContext = createContext({
  theme: createTheme(THEME_MODES.light),
  mode: THEME_MODES.light,
  preference: THEME_PREFERENCES.manual,
  hasHydrated: false,
  needsThemeChoice: true,
  setThemeMode: () => {},
  setThemePreference: () => {},
  completeThemeChoice: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [manualMode, setManualMode] = useState(THEME_MODES.light);
  const [preference, setPreference] = useState(THEME_PREFERENCES.manual);
  const [systemMode, setSystemMode] = useState(
    Appearance.getColorScheme() === THEME_MODES.dark
      ? THEME_MODES.dark
      : THEME_MODES.light
  );
  const [hasHydrated, setHasHydrated] = useState(false);
  const [needsThemeChoice, setNeedsThemeChoice] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadThemeMode = async () => {
      try {
        const [storedMode, storedPreference] = await Promise.all([
          AsyncStorage.getItem(THEME_STORAGE_KEY),
          AsyncStorage.getItem(THEME_PREFERENCE_KEY),
        ]);
        if (
          storedMode &&
          Object.values(THEME_MODES).includes(storedMode) &&
          isMounted
        ) {
          setManualMode(storedMode);
        }
        if (
          storedPreference &&
          Object.values(THEME_PREFERENCES).includes(storedPreference) &&
          isMounted
        ) {
          setPreference(storedPreference);
          setNeedsThemeChoice(false);
        }
      } catch (error) {
        console.warn("Failed to load theme preference", error);
      } finally {
        if (isMounted) {
          setHasHydrated(true);
        }
      }
    };
    loadThemeMode();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemMode(
        colorScheme === THEME_MODES.dark ? THEME_MODES.dark : THEME_MODES.light
      );
    });
    return () => {
      subscription?.remove();
    };
  }, []);

  const setThemeMode = useCallback(async (nextMode) => {
    setManualMode(nextMode);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, nextMode);
    } catch (error) {
      console.warn("Failed to persist theme preference", error);
    }
  }, []);

  const setThemePreference = useCallback(async (nextPreference) => {
    setPreference(nextPreference);
    try {
      await AsyncStorage.setItem(THEME_PREFERENCE_KEY, nextPreference);
    } catch (error) {
      console.warn("Failed to persist theme preference", error);
    }
  }, []);

  const completeThemeChoice = useCallback(async (nextPreference) => {
    setNeedsThemeChoice(false);
    if (nextPreference) {
      await setThemePreference(nextPreference);
    }
  }, [setThemePreference]);

  const mode =
    preference === THEME_PREFERENCES.system ? systemMode : manualMode;
  const theme = useMemo(() => createTheme(mode), [mode]);

  const value = useMemo(
    () => ({
      theme,
      mode,
      preference,
      hasHydrated,
      needsThemeChoice,
      setThemeMode,
      setThemePreference,
      completeThemeChoice,
    }),
    [
      theme,
      mode,
      preference,
      hasHydrated,
      needsThemeChoice,
      setThemeMode,
      setThemePreference,
      completeThemeChoice,
    ]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};