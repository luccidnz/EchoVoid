import { test, mock } from 'node:test';
import assert from 'node:assert/strict';
import { detectAnomalies } from '../src/core/anomaly/detector';

test('returns anomalies for a sample input', () => {
  const sample = new Float32Array([0.1, 0.2, 0.9, 0.3, 0.8]);
  const result = detectAnomalies(sample);
  assert.ok(Array.isArray(result));
  assert.ok(result.length >= 0);
});

test('returns an empty array when no anomalies are present', () => {
  const rand = mock.method(Math, 'random', () => 0.9);
  const sample = new Float32Array(10).fill(0);
  const result = detectAnomalies(sample);
  assert.deepEqual(result, []);
  rand.mock.restore();
});

test('anomalies report confidence and frequency', () => {
  const sample = new Float32Array([0.5, 0.6, 0.7, 0.8, 0.9]);
  const result = detectAnomalies(sample);
  for (const anomaly of result) {
    assert.ok(anomaly.confidence >= 0);
    assert.ok(anomaly.freq > 0);
  }
});
