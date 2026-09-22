import { XorShift32, mixSeed } from './random';

const SAMPLE_RATE = 22050;

type SynthKind = 'vowel' | 'breath' | 'static' | 'chirp';

export interface SynthSpec {
  kind: SynthKind;
  variant: number;
  vowel?: 'a' | 'e' | 'i' | 'o' | 'u';
  durationMs: number;
  reverse?: boolean;
}

const FORMANTS: Record<'a' | 'e' | 'i' | 'o' | 'u', [number, number, number]> = {
  a: [730, 1090, 2440],
  e: [530, 1840, 2480],
  i: [270, 2290, 3010],
  o: [570, 840, 2410],
  u: [300, 870, 2240],
};

const clampSample = (v: number) => Math.max(-1, Math.min(1, v));

function envelope(t: number, duration: number): number {
  const attack = Math.min(0.035, duration * 0.18);
  const release = Math.min(0.09, duration * 0.3);
  if (t < attack) return t / Math.max(attack, 0.001);
  if (t > duration - release) return Math.max(0, (duration - t) / Math.max(release, 0.001));
  return 1;
}

function generateSamples(spec: SynthSpec): Int16Array {
  const total = Math.max(32, Math.floor((spec.durationMs / 1000) * SAMPLE_RATE));
  const out = new Int16Array(total);
  const rng = new XorShift32(mixSeed(spec.variant, spec.durationMs, spec.kind.length * 911));
  const duration = total / SAMPLE_RATE;
  let lp = 0;

  for (let i = 0; i < total; i += 1) {
    const t = i / SAMPLE_RATE;
    const env = envelope(t, duration);
    let sample = 0;

    if (spec.kind === 'vowel') {
      const vowel = spec.vowel ?? 'a';
      const [f1, f2, f3] = FORMANTS[vowel];
      const f0 = 78 + (spec.variant % 5) * 11 + 7 * Math.sin(t * 4.2);
      const flutter = 1 + 0.006 * Math.sin(t * (12 + spec.variant));
      sample =
        0.2 * Math.sin(2 * Math.PI * f0 * t) +
        0.34 * Math.sin(2 * Math.PI * f1 * flutter * t) +
        0.23 * Math.sin(2 * Math.PI * f2 * t + 0.4) +
        0.11 * Math.sin(2 * Math.PI * f3 * t + 1.1) +
        (rng.next() - 0.5) * 0.08;
      sample *= 0.62;
    } else if (spec.kind === 'breath') {
      const white = rng.next() * 2 - 1;
      lp += 0.08 * (white - lp);
      const pulse = 0.55 + 0.45 * Math.sin(2 * Math.PI * (2.3 + spec.variant * 0.17) * t) ** 2;
      sample = (white * 0.45 + lp * 0.55) * pulse * 0.55;
    } else if (spec.kind === 'static') {
      const white = rng.next() * 2 - 1;
      lp += (0.03 + (spec.variant % 3) * 0.025) * (white - lp);
      const crackle = rng.chance(0.002 + spec.variant * 0.0004) ? rng.range(-1, 1) : 0;
      sample = white * 0.27 + lp * 0.38 + crackle * 0.58;
    } else {
      const start = 280 + spec.variant * 145;
      const end = 3600 - spec.variant * 170;
      const progress = t / duration;
      const f = start + (end - start) * progress;
      sample = 0.48 * Math.sin(2 * Math.PI * f * t) + (rng.next() - 0.5) * 0.05;
    }

    out[i] = Math.round(clampSample(sample * env) * 32767);
  }

  if (spec.reverse) {
    out.reverse();
  }
  return out;
}

function writeAscii(view: DataView, offset: number, text: string) {
  for (let i = 0; i < text.length; i += 1) view.setUint8(offset + i, text.charCodeAt(i));
}

export function encodeMono16Wav(samples: Int16Array, sampleRate = SAMPLE_RATE): Uint8Array {
  const bytesPerSample = 2;
  const dataSize = samples.length * bytesPerSample;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);
  writeAscii(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeAscii(view, 8, 'WAVE');
  writeAscii(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * bytesPerSample, true);
  view.setUint16(32, bytesPerSample, true);
  view.setUint16(34, 16, true);
  writeAscii(view, 36, 'data');
  view.setUint32(40, dataSize, true);
  let offset = 44;
  for (const sample of samples) {
    view.setInt16(offset, sample, true);
    offset += 2;
  }
  return new Uint8Array(buffer);
}

export function synthWav(spec: SynthSpec): Uint8Array {
  return encodeMono16Wav(generateSamples(spec));
}

const BASE64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
export function bytesToBase64(bytes: Uint8Array): string {
  let result = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i];
    const b = i + 1 < bytes.length ? bytes[i + 1] : 0;
    const c = i + 2 < bytes.length ? bytes[i + 2] : 0;
    const triple = (a << 16) | (b << 8) | c;
    result += BASE64[(triple >> 18) & 63];
    result += BASE64[(triple >> 12) & 63];
    result += i + 1 < bytes.length ? BASE64[(triple >> 6) & 63] : '=';
    result += i + 2 < bytes.length ? BASE64[triple & 63] : '=';
  }
  return result;
}
