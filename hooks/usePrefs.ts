import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * React hook for reading and writing a preference value. The value is loaded
 * asynchronously from {@link AsyncStorage}. When the `key` changes or the
 * component unmounts, any in-flight `getItem` call is ignored to avoid
 * updating state with stale data.
 */
export function usePrefs<T = any>(key: string, initial: T): [T, (v: T) => void] {
  const [value, setValue] = useState<T>(initial);

  // Load stored value on mount or when the key changes. Guard against race
  // conditions where a previous `getItem` resolves after the key has changed by
  // cancelling the effect and checking that the key is still current.
  useEffect(() => {
    let cancelled = false;
    const currentKey = key;

    AsyncStorage.getItem(currentKey).then((stored) => {
      if (cancelled || currentKey !== key) return;
      if (stored !== null) {
        try { setValue(JSON.parse(stored)); } catch {}
      }
    });

    return () => { cancelled = true; };
  }, [key]);

  // Persist value whenever it changes.
  useEffect(() => {
    AsyncStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  const set = useCallback((v: T) => setValue(v), []);
  return [value, set];
}

export const prefs = {
  get: async <T = any>(key: string, fallback?: T): Promise<T | undefined> => {
    const stored = await AsyncStorage.getItem(key);
    if (stored !== null) {
      try { return JSON.parse(stored); } catch {}
    }
    return fallback;
  },
  set: (key: string, value: any) => AsyncStorage.setItem(key, JSON.stringify(value)),
  remove: (key: string) => AsyncStorage.removeItem(key),
};

