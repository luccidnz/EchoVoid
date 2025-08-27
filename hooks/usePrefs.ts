import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function usePrefs<T = any>(key: string, initial: T): [T, (v: T) => void] {
  const [value, setValue] = useState<T>(initial);

  useEffect(() => {
    AsyncStorage.getItem(key).then((stored) => {
      if (stored !== null) {
        try {
          setValue(JSON.parse(stored));
        } catch {
          // ignore parse errors and fall back to initial value
        }
      }
    });
  }, [key]);

  const set = useCallback((v: T) => {
    setValue(v);
    AsyncStorage.setItem(key, JSON.stringify(v));
  }, [key]);

  return [value, set];
}

export const prefs = {
  get: async <T = any>(key: string, fallback?: T): Promise<T | undefined> => {
    const stored = await AsyncStorage.getItem(key);
    if (stored !== null) {
      try {
        return JSON.parse(stored);
      } catch {
        // ignore parse errors
      }
    }
    return fallback;
  },
  set: (key: string, value: any) => AsyncStorage.setItem(key, JSON.stringify(value)),
  remove: (key: string) => AsyncStorage.removeItem(key),
};
