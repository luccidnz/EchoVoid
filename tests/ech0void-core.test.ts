import test from 'node:test';
import assert from 'node:assert/strict';
import { XorShift32, mixSeed, stableStringSeed } from '../src/ech0void/random';
import { bytesToBase64, encodeMono16Wav, synthWav } from '../src/ech0void/wav';

test('seeded generator is deterministic', () => {
  const a = new XorShift32(12345);
  const b = new XorShift32(12345);
  assert.deepEqual([a.nextUint(), a.nextUint(), a.nextUint()], [b.nextUint(), b.nextUint(), b.nextUint()]);
  assert.equal(mixSeed(1, 2, 3), mixSeed(1, 2, 3));
  assert.equal(stableStringSeed('Ech0Void'), stableStringSeed('Ech0Void'));
});

test('wav encoder emits a valid RIFF/WAVE header', () => {
  const wav = encodeMono16Wav(new Int16Array([0, 100, -100, 32767, -32768]), 22050);
  assert.equal(String.fromCharCode(...wav.slice(0, 4)), 'RIFF');
  assert.equal(String.fromCharCode(...wav.slice(8, 12)), 'WAVE');
  assert.equal(String.fromCharCode(...wav.slice(36, 40)), 'data');
  assert.equal(wav.length, 54);
});

test('procedural synth is non-empty and base64 encodes', () => {
  const wav = synthWav({ kind: 'vowel', vowel: 'o', variant: 2, durationMs: 320 });
  assert.ok(wav.length > 1000);
  const encoded = bytesToBase64(wav);
  assert.ok(encoded.startsWith('UklGR'));
  assert.equal(encoded.length % 4, 0);
});
