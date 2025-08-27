import * as Speech from 'expo-speech';
export type VoicePreset = 'esmera'|'deep'|'airy'|'clone';
export function speak(text:string, voice:VoicePreset='esmera', unclear=false){
  const phrase = unclear ? `Unclear. ${text}` : text;
  Speech.speak(phrase, { pitch:presetPitch(voice), rate:0.95, language:'en-NZ' });
}
function presetPitch(v:VoicePreset){
  switch(v){
    case 'deep': return 0.8;
    case 'airy': return 1.2;
    case 'clone': return 1.0;
    default: return 0.9;
  }
}
export async function trainVoice(_samples:string[]){ /* placeholder for voice cloning */ }
export const speakEsmera = (text:string, unclear=false)=> speak(text,'esmera',unclear);
