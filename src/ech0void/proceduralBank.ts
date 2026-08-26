import * as FileSystem from 'expo-file-system/legacy';
import type { ClipFamily, ProceduralClip } from './types';
import { bytesToBase64, synthWav, type SynthSpec } from './wav';

const BANK_VERSION = 'v2';
const BANK_DIR = `${FileSystem.cacheDirectory ?? ''}ech0void-bank-${BANK_VERSION}/`;

type ClipRecipe = SynthSpec & { id: string; family: ClipFamily; label: string };

const vowels = ['a', 'e', 'i', 'o', 'u'] as const;
const recipes: ClipRecipe[] = [
  ...vowels.flatMap((vowel, index) => [
    {
      id: `voice-${vowel}-${index}`,
      family: 'vocal' as const,
      label: `generated vowel-like ${vowel.toUpperCase()} fragment`,
      kind: 'vowel' as const,
      vowel,
      variant: index + 1,
      durationMs: 290 + index * 27,
    },
    {
      id: `reverse-${vowel}-${index}`,
      family: 'reversed' as const,
      label: `generated reversed ${vowel.toUpperCase()} fragment`,
      kind: 'vowel' as const,
      vowel,
      variant: index + 7,
      durationMs: 310 + index * 23,
      reverse: true,
    },
  ]),
  ...[0, 1, 2].map((variant) => ({
    id: `breath-${variant}`,
    family: 'breath' as const,
    label: `generated breath texture ${variant + 1}`,
    kind: 'breath' as const,
    variant,
    durationMs: 520 + variant * 90,
  })),
  ...[0, 1, 2].map((variant) => ({
    id: `static-${variant}`,
    family: 'noise' as const,
    label: `generated static bed ${variant + 1}`,
    kind: 'static' as const,
    variant,
    durationMs: 920 + variant * 110,
  })),
  ...[0, 1, 2].map((variant) => ({
    id: `scan-${variant}`,
    family: 'scan' as const,
    label: `generated scan chirp ${variant + 1}`,
    kind: 'chirp' as const,
    variant,
    durationMs: 220 + variant * 65,
  })),
];

let cachedBank: ProceduralClip[] | null = null;

async function ensureDirectory() {
  if (!FileSystem.cacheDirectory) throw new Error('No cache directory is available on this device.');
  await FileSystem.makeDirectoryAsync(BANK_DIR, { intermediates: true }).catch(() => undefined);
}

export async function buildProceduralBank(): Promise<ProceduralClip[]> {
  if (cachedBank) return cachedBank;
  await ensureDirectory();

  const clips: ProceduralClip[] = [];
  for (const recipe of recipes) {
    const uri = `${BANK_DIR}${recipe.id}.wav`;
    const info = await FileSystem.getInfoAsync(uri);
    if (!info.exists || (typeof info.size === 'number' && info.size < 64)) {
      const wav = synthWav(recipe);
      await FileSystem.writeAsStringAsync(uri, bytesToBase64(wav), {
        encoding: FileSystem.EncodingType.Base64,
      });
    }
    clips.push({
      id: recipe.id,
      uri,
      family: recipe.family,
      durationMs: recipe.durationMs,
      label: recipe.label,
    });
  }

  cachedBank = clips;
  return clips;
}
