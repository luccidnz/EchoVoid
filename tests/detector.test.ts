import { test } from 'node:test';
import assert from 'node:assert';
import { detectAnomalies } from '../src/core/anomaly/detector';

test('returns anomalies for a sample input', () => {
  const sample = new Float32Array([0.1, 0.2, 0.9, 0.3, 0.8]);
  const result = detectAnomalies(sample);
  assert.ok(Array.isArray(result));
  assert.strictEqual(result.length, 2);
});

test('returns an empty array for no anomalies', () => {
  const sample = new Float32Array(10).fill(0);
  const result = detectAnomalies(sample);
  assert.deepStrictEqual(result, []);
});

test('detects anomalies with confidence above threshold', () => {
  const sample = new Float32Array([0.5, 0.6, 0.7, 0.8, 0.9]);
  const result = detectAnomalies(sample);
  result.forEach((anomaly) => {
    assert.ok(anomaly.confidence >= 0.5);
    assert.ok(anomaly.freq > 0);
  });
});

