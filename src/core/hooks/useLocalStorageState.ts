"use client";

import { useState, useEffect, useRef, useCallback, type SetStateAction } from 'react';
import { idb } from '@/core/utils/indexedDB';

export function useLocalStorageState<T>(key: string, initialValue: T) {
  const initial = useRef(initialValue);
  const [snapshot, setSnapshot] = useState({ key, value: initialValue, loaded: false, edited: false });

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      let value = initial.current;
      try {
        const stored = await idb.get<T>(key);
        if (stored !== null) value = stored;
      } catch (error) {
        console.error(`Error loading ${key} from IndexedDB:`, error);
      }
      if (!cancelled) {
        setSnapshot(previous => previous.key === key && previous.edited
          ? previous
          : { key, value, loaded: true, edited: false });
      }
    };
    void load();
    return () => { cancelled = true; };
  }, [key]);

  const setState = useCallback((action: SetStateAction<T>) => {
    setSnapshot(previous => {
      const current = previous.key === key ? previous.value : initial.current;
      const value = typeof action === 'function' ? (action as (value: T) => T)(current) : action;
      return { key, value, loaded: true, edited: true };
    });
  }, [key]);

  useEffect(() => {
    // Hydration and key changes must never write a default or another key's value.
    if (snapshot.key !== key || !snapshot.loaded || !snapshot.edited) return;
    void idb.set(key, snapshot.value).catch(error => console.error('Error saving to IndexedDB:', error));
  }, [key, snapshot]);

  return [snapshot.key === key ? snapshot.value : initialValue, setState, snapshot.key === key && snapshot.loaded] as const;
}
