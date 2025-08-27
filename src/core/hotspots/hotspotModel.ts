const hits = new Map<number, number>();
export function recordHit(freq:number){ hits.set(freq, (hits.get(freq)||0)+1); }
export function topHotspots(n=5){ return Array.from(hits.entries()).sort((a,b)=>b[1]-a[1]).slice(0,n); }
