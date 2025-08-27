import * as Speech from 'expo-speech';
import React, { useEffect, useState, createContext, useContext } from 'react';

type Voice = { identifier: string; name: string; language: string };

export interface EsmeraTTS {
  speak: (text: string, opts?: { pitch?: number; rate?: number; voiceId?: string; volume?: number }) => void;
  availableVoices: Voice[];
  isLimited: boolean;
}

const EsmeraContext = createContext<EsmeraTTS>({
  speak: () => {},
  availableVoices: [],
  isLimited: true,
});

export function useEsmera() {
  return useContext(EsmeraContext);
}

const EsmeraProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [isLimited, setIsLimited] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const v = await Speech.getAvailableVoicesAsync();
        if (Array.isArray(v) && v.length > 0) {
          setVoices(v);
          setIsLimited(false);
        } else {
          setVoices([]);
          setIsLimited(true);
        }
      } catch {
        setVoices([]);
        setIsLimited(true);
      }
    })();
  }, []);

  const speak = (text: string, opts?: { pitch?: number; rate?: number; voiceId?: string; volume?: number }) => {
    Speech.speak(text, {
      pitch: opts?.pitch ?? 1.0,
      rate: opts?.rate ?? 1.0,
      volume: opts?.volume ?? 1.0,
      voice: opts?.voiceId || undefined,
      language: 'en',
    });
  };

  return (
    <EsmeraContext.Provider value={{ speak, availableVoices: voices, isLimited }}>
      {children}
    </EsmeraContext.Provider>
  );
};

export default EsmeraProvider;
