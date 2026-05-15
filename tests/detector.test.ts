import { detectAnomalies } from '../src/core/anomaly/detector';

describe('Anomaly Detector', () => {
  it('returns time indexed hits', () => {
    const sample = new Float32Array([0.1, 0.2, 0.9, 0.3, 0.8]);
    const result = detectAnomalies(sample);
    expect(result.length).toBe(2);
    expect(result[0].time).toBe(2);
    expect(result[1].time).toBe(4);
  });

  it('should return an empty array for no anomalies', () => {
    const sample = new Float32Array(10).fill(0);
    const result = detectAnomalies(sample);
    expect(result).toEqual([]);
  });

  it('includes frequency and confidence', () => {
    const sample = new Float32Array([0.6, 0.7]);
    const result = detectAnomalies(sample);
    expect(result[0].freq).toBeGreaterThan(0);
    expect(result[0].confidence).toBe(0.6);
  });
});
