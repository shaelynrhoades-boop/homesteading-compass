import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeContextValue = {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkModeState] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem('homestead:dark-mode');
        if (stored === 'true') {
          setDarkModeState(true);
        }
      } catch {
        // Ignore load errors.
      }
    };
    void load();
  }, []);

  const setDarkMode = (value: boolean) => {
    setDarkModeState(value);
    void AsyncStorage.setItem('homestead:dark-mode', value ? 'true' : 'false');
  };

  const value = useMemo(() => ({ darkMode, setDarkMode }), [darkMode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
