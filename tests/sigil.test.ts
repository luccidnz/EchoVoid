import { test } from 'node:test';
import assert from 'node:assert';
import buildSigil from '../services/sigil/buildSigil';

test('buildSigil creates SVG path from phrase', () => {
  const path = buildSigil('HELLO WORLD');
  assert.ok(path.startsWith('M'));
  assert.ok(path.endsWith('Z'));
  const segments = path.slice(1, -1).split('L');
  assert.strictEqual(segments.length, 6);
});

test('buildSigil handles phrases with only vowels', () => {
  const path = buildSigil('AEIOU');
  assert.strictEqual(path, 'MZ');
});
