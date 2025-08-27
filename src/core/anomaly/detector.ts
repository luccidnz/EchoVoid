// Simple mock anomaly detector; replace with real ML model later
export type AnomalyHit = { time:number; freq:number; confidence:number; uncertain?:boolean };
export function detectAnomalies(_buffer:Float32Array):AnomalyHit[]{
  if(Math.random() < 0.1){
    return [{ time: Date.now(), freq: 1000+Math.random()*5000, confidence: Math.random(), uncertain: Math.random() < 0.5 }];
  }
  return [];
}
export let sensitivity = 0.5;
export function setSensitivity(s:number){ sensitivity = s; }
