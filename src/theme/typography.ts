import { scaleFont } from 'src/utils/scale';

export const TYPE = {
  h1: { fontSize: scaleFont(28), fontWeight: '800', letterSpacing: 0.5 },
  h2: { fontSize: scaleFont(20), fontWeight: '700' },
  body: { fontSize: scaleFont(16), fontWeight: '400' }
};
