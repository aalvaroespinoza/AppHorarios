"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { applyBrowserTheme, readBrowserTheme, type ThemeMode } from '@/lib/theme';
export type { ThemeMode } from '@/lib/theme';

interface ThemeContextProps {
  theme: ThemeMode;
  isDark: boolean;
  setTheme: (theme: ThemeMode) => void;
}
const ThemeContext = createContext<ThemeContextProps>({ theme: 'dark', isDark: true, setTheme: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState({ theme: 'dark' as ThemeMode, isDark: true });
  const selectedMode = useRef<ThemeMode | undefined>(undefined);

  useEffect(() => {
    const refresh = () => {
      const next = readBrowserTheme(selectedMode.current);
      selectedMode.current = next.theme;
      setState(next);
      applyBrowserTheme(next.isDark);
    };
    refresh();
    const onStorage = () => { selectedMode.current = undefined; refresh(); };
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    media.addEventListener('change', refresh);
    window.addEventListener('storage', onStorage);
    window.addEventListener('pageshow', refresh);
    const interval = window.setInterval(refresh, 60_000);
    return () => {
      media.removeEventListener('change', refresh);
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('pageshow', refresh);
      window.clearInterval(interval);
    };
  }, []);

  const setTheme = useCallback((theme: ThemeMode) => {
    selectedMode.current = theme;
    try { window.localStorage.setItem('app_theme', theme); } catch { /* Keep usable without storage. */ }
    const next = readBrowserTheme(theme);
    setState(next);
    applyBrowserTheme(next.isDark);
  }, []);

  return <ThemeContext.Provider value={{ ...state, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() { return useContext(ThemeContext); }
