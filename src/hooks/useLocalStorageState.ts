"use client";

import { useState, useEffect } from 'react';

export function useLocalStorageState<T>(key: string, initialValue: T) {
  const [state, setState] = useState<T>(initialValue);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(key);
      if (stored) {
        try {
          setState(JSON.parse(stored));
        } catch (e) {
          console.error(`Error parsing ${key} from localStorage:`, e);
        }
      }
    }
  }, [key]);

  useEffect(() => {
    if (isMounted && typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(state));
    }
  }, [state, isMounted, key]);

  return [state, setState, isMounted] as const;
}
