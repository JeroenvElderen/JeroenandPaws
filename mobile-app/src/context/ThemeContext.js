import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createTheme, THEME_MODES } from "../theme/theme";

const THEME_STORAGE_KEY = "jeroenpaws:themeMode";

export const ThemeContext = createContext({
  theme: createTheme(THEME_MODES.dark),
  mode: THEME_MODES.dark,
  setThemeMode: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(THEME_MODES.dark);

  useEffect(() => {
    let isMounted = true;
    const loadThemeMode = async () => {
      try {
        const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (stored && Object.values(THEME_MODES).includes(stored) && isMounted) {
          setMode(stored);
        }
      } catch (error) {
        console.warn("Failed to load theme preference", error);
      }
    };
    loadThemeMode();
    return () => {
      isMounted = false;
    };
  }, []);

  const setThemeMode = useCallback(async (nextMode) => {
    setMode(nextMode);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, nextMode);
    } catch (error) {
      console.warn("Failed to persist theme preference", error);
    }
  }, []);

  const theme = useMemo(() => createTheme(mode), [mode]);

  const value = useMemo(
    () => ({ theme, mode, setThemeMode }),
    [mode, setThemeMode, theme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
