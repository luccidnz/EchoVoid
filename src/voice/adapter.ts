// Works in Expo Go (no native voice) and Dev Client (with native voice)
import * as Speech from 'expo-speech';
import { NativeModules } from 'react-native';
let Voice: any = null;

try {
  // Dynamically require: will only succeed in Dev Client / EAS build
  // @ts-ignore
  Voice = require('@react-native-voice/voice').default;
} catch (_) {
  Voice = null;
}

export const hasNativeVoice = !!(NativeModules?.Voice || Voice);

export async function speak(text: string) {
  Speech.speak(text, { rate: 1.0, pitch: 1.0, language: 'en' });
}

export function startListening(_: (t: string) => void) {
  if (!hasNativeVoice) return false; // Expo Go: no-op
  // wire up Voice.* events here if you keep RN-Voice installed
  return true;
}

export function stopListening() {
  if (!hasNativeVoice) return;
  // Voice.stop();
}
