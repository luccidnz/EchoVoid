import { useCallback, useEffect, useState } from 'react';
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV();

export function usePrefs<T = any>(key: string, initial: T): [T, (v: T) => void] {
  const [value, setValue] = useState<T>(() => {
    const stored = storage.getString(key);
    if (stored !== undefined) {
      try { return JSON.parse(stored); } catch {}
    }
    return initial;
  });

  useEffect(() => {
    storage.set(key, JSON.stringify(value));
  }, [key, value]);

  const set = useCallback((v: T) => setValue(v), []);
  return [value, set];
}

export const prefs = {
  get: <T = any>(key: string, fallback?: T): T | undefined => {
    const stored = storage.getString(key);
    if (stored !== undefined) {
      try { return JSON.parse(stored); } catch {}
    }
    return fallback;
  },
  set: (key: string, value: any) => storage.set(key, JSON.stringify(value)),
  remove: (key: string) => storage.delete(key),
};
