import { test } from 'node:test';
import assert from 'node:assert';
import * as hotspot from '../src/core/hotspots/hotspotModel';

test('records hits and returns sorted hotspots', () => {
  hotspot.recordHit(100);
  hotspot.recordHit(200);
  hotspot.recordHit(100);
  const top = hotspot.topHotspots();
  assert.deepStrictEqual(top, [[100, 2], [200, 1]]);
});
