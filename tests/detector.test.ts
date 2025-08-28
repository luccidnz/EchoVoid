import { test } from 'node:test';
import assert from 'node:assert';

import { detectAnomalies } from '../src/core/anomaly/detector';

// The detector uses Math.random internally. Mock it for deterministic tests.

test('returns anomalies for a sample input', (t) => {
  const sequence = [0.05, 0.2, 0.3, 0.4];
  t.mock.method(Math, 'random', () => sequence.shift()!);

  const sample = new Float32Array([0.1, 0.2, 0.9, 0.3, 0.8]);
  const result = detectAnomalies(sample);

  assert.strictEqual(result.length, 1);
  const anomaly = result[0];
  // 1000 + 0.2 * 5000 = 2000
  assert.strictEqual(anomaly.freq, 2000);
  assert.strictEqual(anomaly.confidence, 0.3);
  assert.strictEqual(anomaly.uncertain, true);
});

test('returns an empty array when no anomaly is detected', (t) => {
  t.mock.method(Math, 'random', () => 0.5);

  const sample = new Float32Array(10).fill(0);
  const result = detectAnomalies(sample);
  assert.deepStrictEqual(result, []);
});

