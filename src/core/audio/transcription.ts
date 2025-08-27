import { useEffect, useState } from 'react';
import { hasNativeVoice, startListening, stopListening } from 'src/voice/adapter';

export function useTranscription() {
  const [text, setText] = useState('');
  const [conf, setConf] = useState<number | null>(null);
  const [listening, setListening] = useState(false);

  useEffect(() => {
    // No direct event wiring in Expo Go; handled in adapter for Dev Client
    return () => {};
  }, []);

  const start = async () => {
    setListening(true);
    if (hasNativeVoice) {
      startListening((t) => {
        setText(t);
        setConf(null); // Confidence not available in Expo Go
      });
    }
  };

  const stop = async () => {
    setListening(false);
    if (hasNativeVoice) {
      stopListening();
    }
  };

  return { text, conf, listening, supported: hasNativeVoice, start, stop };
}
