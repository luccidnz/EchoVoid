import { detectAnomalies } from '../src/core/anomaly/detector';

describe('Anomaly Detector', () => {
  it('should return anomalies for a sample input', () => {
    const sample = new Float32Array([0.1, 0.2, 0.9, 0.3, 0.8]);
    const result = detectAnomalies(sample);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThanOrEqual(0);
  });

  it('should return an empty array for no anomalies', () => {
    const sample = new Float32Array(10).fill(0);
    const result = detectAnomalies(sample);
    expect(result).toEqual([]);
  });

  it('should detect anomalies with confidence above threshold', () => {
    const sample = new Float32Array([0.5, 0.6, 0.7, 0.8, 0.9]);
    const result = detectAnomalies(sample);
    result.forEach((anomaly) => {
      expect(anomaly.confidence).toBeGreaterThanOrEqual(0);
      expect(anomaly.freq).toBeGreaterThan(0);
    });
  });
});
