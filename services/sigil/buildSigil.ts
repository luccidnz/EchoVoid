// TODO: Build sigil SVG path from phrase (remove vowels, dedupe, stack/radial)
export default function buildSigil(phrase: string) {
  const cleaned = phrase
    .toUpperCase()
    .replace(/[AEIOU]/g, '') // Remove vowels
    .split('')
    .filter((char, index, self) => self.indexOf(char) === index); // Dedupe

  const points = cleaned.map((char, index) => {
    const angle = (index / cleaned.length) * 2 * Math.PI;
    const x = 50 + 40 * Math.cos(angle);
    const y = 50 + 40 * Math.sin(angle);
    return `${x},${y}`;
  });

  return `M${points.join('L')}Z`; // Create SVG path
}
