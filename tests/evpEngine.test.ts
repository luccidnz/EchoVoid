import { test } from 'node:test';
import assert from 'node:assert';
import { createEngine, PRESETS } from '../src/core/audio/evpEngine';

test('engine exposes default settings and updates them', () => {
  const engine = createEngine();
  assert.strictEqual(engine.settings.rateHz, 3);
  engine.setSettings({ rateHz: 5, aether: { grain: 0.3 } });
  assert.strictEqual(engine.settings.rateHz, 5);
  assert.strictEqual(engine.settings.aether.grain, 0.3);
  assert.strictEqual(engine.settings.aether.mod, 0.5);
});

test('level$ subscriber receives amplitudes between 0.2 and 1.0', (t) => {
  t.mock.timers.enable();
  const engine = createEngine();
  let received: number | null = null;
  const unsub = engine.level$((amp) => { received = amp; });
  t.mock.method(Math, 'random', () => 0.5);
  t.mock.timers.tick(100);
  assert.ok(received !== null && Math.abs(received - 0.6) < 1e-9);
  unsub();
  received = null;
  t.mock.timers.tick(100);
  assert.strictEqual(received, null);
    t.mock.timers.reset();
});


test('PRESETS include expected keys', () => {
  assert.deepStrictEqual(Object.keys(PRESETS), ['Focused', 'Broad', 'Random']);
});
