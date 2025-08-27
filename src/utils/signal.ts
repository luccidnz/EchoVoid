export function clamp(n:number,min=0,max=1){ return Math.min(max,Math.max(min,n)); }
export function ema(prev:number, next:number, a=0.2){ return prev*(1-a)+next*a; }
