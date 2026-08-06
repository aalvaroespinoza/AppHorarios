"use client";

import { useState, useEffect, useRef } from 'react';
import { idb } from '@/core/utils/indexedDB';

export function useLocalStorageState<T>(key: string, initialValue: T) {
  const [state, setState] = useState<T>(initialValue);
  const [isMounted, setIsMounted] = useState(false);
  const isFirstRender = useRef(true);

  useEffect(() => {
    let isCancelled = false;
    const loadData = async () => {
      try {
        const stored = await idb.get<T>(key);
        if (!isCancelled) {
          if (stored !== null) {
            setState(stored);
          }
          setIsMounted(true);
        }
      } catch (e) {
        console.error(`Error loading ${key} from IndexedDB:`, e);
        if (!isCancelled) setIsMounted(true);
      }
    };
    loadData();
    return () => {
      isCancelled = true;
    };
  }, [key]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (isMounted && typeof window !== 'undefined') {
      idb.set(key, state).catch(e => console.error('Error saving to IndexedDB:', e));
    }
  }, [state, isMounted, key]);

  return [state, setState, isMounted] as const;
}
