import { test } from 'node:test';
import assert from 'node:assert';
import { clamp, ema } from '../src/utils/signal';

test('clamp bounds', () => {
  assert.strictEqual(clamp(2,0,1),1);
  assert.strictEqual(clamp(-1,0,1),0);
});

test('ema progress', () => {
  const out = ema(0,1,0.5);
  assert.strictEqual(out,0.5);
});
