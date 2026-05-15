export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 28,
  display: 40
};

export const FONT_WEIGHTS = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900'
};

export const TYPE = {
  h1: { fontSize: FONT_SIZES.xxxl, fontWeight: FONT_WEIGHTS.extrabold, letterSpacing: 0.5 },
  h2: { fontSize: FONT_SIZES.xl, fontWeight: FONT_WEIGHTS.bold },
  body: { fontSize: FONT_SIZES.md, fontWeight: FONT_WEIGHTS.regular }
};
