import { test } from 'node:test';
import assert from 'node:assert';
import { clamp, ema, fft } from '../src/utils/signal';

test('clamp bounds', () => {
  assert.strictEqual(clamp(2,0,1),1);
  assert.strictEqual(clamp(-1,0,1),0);
});

test('ema progress', () => {
  const out = ema(0,1,0.5);
  assert.strictEqual(out,0.5);
});

test('fft peak detection', () => {
  const N = 8;
  const sine = new Float32Array(Array.from({length:N}, (_,n)=>Math.sin(2*Math.PI*n/N)));
  const spectrum = fft(sine);
  const maxIndex = spectrum.reduce((m,v,i)=> v > spectrum[m] ? i : m, 0);
  assert.strictEqual(maxIndex,1);
});
