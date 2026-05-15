import { clamp, ema } from '../src/utils/signal';

describe('signal utilities', () => {
  test('clamp bounds', () => {
    expect(clamp(2, 0, 1)).toBe(1);
    expect(clamp(-1, 0, 1)).toBe(0);
  });

  test('ema progress', () => {
    const out = ema(0, 1, 0.5);
    expect(out).toBe(0.5);
  });
});
