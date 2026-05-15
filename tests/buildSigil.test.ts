import { test } from 'node:test';
import assert from 'node:assert';
import buildSigil from '../services/sigil/buildSigil.ts';

test('buildSigil generates path for basic phrase', () => {
  const path = buildSigil('abc');
  assert.strictEqual(path, 'M90,50L10,50.00000000000001Z');
});

test('buildSigil removes vowels and duplicate letters', () => {
  const path = buildSigil('Aeaaebbc');
  assert.strictEqual(path, 'M90,50L10,50.00000000000001Z');
});
