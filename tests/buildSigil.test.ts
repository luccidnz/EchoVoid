import buildSigil from '../services/sigil/buildSigil';

test('buildSigil generates SVG path without vowels or duplicates', () => {
  const path = buildSigil('magick');
  expect(path.startsWith('M')).toBe(true);
  expect(path.endsWith('Z')).toBe(true);
  const coordinates = path.slice(1, -1).split('L');
  expect(coordinates.length).toBe(4); // M G C K => 4 unique consonants
});
