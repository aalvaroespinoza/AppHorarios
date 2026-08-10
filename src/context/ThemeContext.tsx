"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark' | 'auto';

interface ThemeContextProps {
  theme: ThemeMode;
  isDark: boolean;
  setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextProps>({
  theme: 'dark',
  isDark: true,
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('dark');
  const [isDark, setIsDark] = useState<boolean>(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem('app_theme') as ThemeMode | null;
    if (savedTheme) {
      setThemeState(savedTheme);
    }
  }, []);

  const evaluateTheme = (currentTheme: ThemeMode) => {
    if (currentTheme === 'light') return false;
    if (currentTheme === 'dark') return true;
    
    // Auto mode
    try {
      const cacheRaw = localStorage.getItem('weather_cache_cordoba');
      if (cacheRaw) {
        const w = JSON.parse(cacheRaw);
        if (w && w.data && w.data.daily && w.data.daily.length > 0) {
          const now = new Date();
          const sunrise = new Date(w.data.daily[0].sunrise);
          const sunset = new Date(w.data.daily[0].sunset);
          return now < sunrise || now >= sunset;
        }
      }
    } catch (e) {}
    
    return true; // default fallback for auto
  };

  useEffect(() => {
    const activeIsDark = evaluateTheme(theme);
    setIsDark(activeIsDark);
    
    if (activeIsDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    if (theme !== 'auto') return;

    // Check every 5 minutes if it crossed the threshold
    const interval = setInterval(() => {
      const activeIsDark = evaluateTheme('auto');
      if (activeIsDark !== isDark) {
        setIsDark(activeIsDark);
        if (activeIsDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [theme, isDark]);

  const setTheme = (newTheme: ThemeMode) => {
    localStorage.setItem('app_theme', newTheme);
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
