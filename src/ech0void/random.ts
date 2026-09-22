export class XorShift32 {
  private state: number;

  constructor(seed: number) {
    this.state = (seed | 0) || 0x6d2b79f5;
  }

  nextUint(): number {
    let x = this.state | 0;
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    this.state = x | 0;
    return x >>> 0;
  }

  next(): number {
    return this.nextUint() / 0xffffffff;
  }

  range(min: number, max: number): number {
    return min + (max - min) * this.next();
  }

  int(maxExclusive: number): number {
    if (maxExclusive <= 1) return 0;
    return Math.floor(this.next() * maxExclusive);
  }

  chance(probability: number): boolean {
    return this.next() < Math.max(0, Math.min(1, probability));
  }
}

export function mixSeed(...values: number[]): number {
  let h = 0x811c9dc5;
  for (const raw of values) {
    let v = Math.floor(Number.isFinite(raw) ? raw : 0) | 0;
    h ^= v;
    h = Math.imul(h, 0x01000193);
    h ^= h >>> 16;
  }
  return h >>> 0;
}

export function stableStringSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
