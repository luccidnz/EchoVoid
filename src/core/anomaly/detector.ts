// Simple threshold based anomaly detector. Any sample whose absolute value
// exceeds the current sensitivity is considered an anomaly. Each hit is
// tagged with its time index (in samples) and a synthetic frequency value.
export type AnomalyHit = { time:number; freq:number; confidence:number; uncertain?:boolean };

export function detectAnomalies(buffer:Float32Array, sampleRate = 1):AnomalyHit[]{
  const hits: AnomalyHit[] = [];
  for(let i=0;i<buffer.length;i++){
    const amp = Math.abs(buffer[i]);
    if(amp >= sensitivity){
      hits.push({ time: i / sampleRate, freq: i + 1, confidence: amp });
    }
  }
  return hits;
}

export let sensitivity = 0.5;
export function setSensitivity(s:number){ sensitivity = s; }
