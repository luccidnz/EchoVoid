import { useCallback, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * React hook for reading and writing a preference value. The value is loaded
 * asynchronously from {@link AsyncStorage}. When the `key` changes or the
 * component unmounts, any in-flight `getItem` call is ignored to avoid
 * updating state with stale data.
 */
export function usePrefs<T = any>(key: string, initial: T): [T, (v: T) => void] {
  const [value, setValue] = useState<T>(initial);
  const loadTokenRef = useRef(0);
  const userSetSinceLoadRef = useRef(false);

  // Load stored value on mount or when the key changes. Guard against race
  // conditions where a previous `getItem` resolves after the key has changed by
  // cancelling the effect and checking that the key is still current.
  useEffect(() => {
    const loadToken = ++loadTokenRef.current;
    userSetSinceLoadRef.current = false;

    AsyncStorage.getItem(key).then((stored) => {
      if (loadToken !== loadTokenRef.current || userSetSinceLoadRef.current) return;
      if (stored !== null) {
        try { setValue(JSON.parse(stored)); } catch {}
      }
    });

    return () => {
      if (loadToken === loadTokenRef.current) {
        loadTokenRef.current += 1;
      }
    };
  }, [key]);

  // Persist value whenever it changes.
  useEffect(() => {
    AsyncStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  const set = useCallback((v: T) => {
    userSetSinceLoadRef.current = true;
    setValue(v);
  }, []);
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
