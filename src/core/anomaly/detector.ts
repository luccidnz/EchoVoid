// Simple threshold based anomaly detector used for tests.
// Later this can be replaced with a proper ML model.
export type AnomalyHit = { time: number; freq: number; confidence: number; uncertain?: boolean };

// Detects anomalies by flagging values that cross the `sensitivity` threshold.
// Each anomaly encodes its position in the buffer as `time` and a synthetic
// frequency derived from the value. This deterministic behaviour keeps unit
// tests stable.
export function detectAnomalies(buffer: Float32Array): AnomalyHit[] {
  const hits: AnomalyHit[] = [];
  buffer.forEach((v, i) => {
    if (v >= sensitivity) {
      hits.push({
        time: i,
        freq: 1000 + v * 5000,
        confidence: v,
      });
    }
  });
  return hits;
}

export let sensitivity = 0.5;
export function setSensitivity(s: number) {
  sensitivity = s;
}
