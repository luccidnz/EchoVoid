import { useMemo } from 'react';

export const spacing = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const typography = {
  h1: { fontSize: 28, fontWeight: '800' as const },
  h2: { fontSize: 24, fontWeight: '800' as const },
  title: { fontSize: 18, fontWeight: '700' as const },
  body: { fontSize: 16, fontWeight: '400' as const },
  caption: { fontSize: 13, fontWeight: '400' as const },
  button: { fontSize: 16, fontWeight: '700' as const, letterSpacing: 0.4 },
  chip: { fontSize: 14, fontWeight: '600' as const },
  label: { fontSize: 16, fontWeight: '600' as const },
  toast: { fontSize: 15, fontWeight: '700' as const },
};

export const elevation = {
  none: { shadowOpacity: 0, shadowRadius: 0, shadowOffset: { width: 0, height: 0 } },
  low: { shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
  medium: { shadowOpacity: 0.3, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
};

export function useDesignSystem() {
  return useMemo(() => ({ spacing, typography, elevation }), []);
}

export type DesignSystem = ReturnType<typeof useDesignSystem>;
