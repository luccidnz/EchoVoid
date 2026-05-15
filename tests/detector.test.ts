import { test } from 'node:test';
import assert from 'node:assert';
import { detectAnomalies } from '../src/core/anomaly/detector';

test('returns empty array when random >= 0.1', () => {
  const orig = Math.random;
  Math.random = () => 0.5; // no anomaly
  const res = detectAnomalies(new Float32Array(10).fill(0));
  assert.deepStrictEqual(res, []);
  Math.random = orig;
});

test('returns anomaly with deterministic random values', () => {
  const orig = Math.random;
  const seq = [0.05, 0.2, 0.3, 0.7];
  let i = 0;
  Math.random = () => seq[i++];
  const res = detectAnomalies(new Float32Array(5).fill(0));
  assert.strictEqual(res.length, 1);
  const hit = res[0];
  assert.strictEqual(typeof hit.time, 'number');
  assert.strictEqual(hit.freq, 1000 + 0.2 * 5000);
  assert.strictEqual(hit.confidence, 0.3);
  assert.strictEqual(hit.uncertain, false);
  Math.random = orig;
});
