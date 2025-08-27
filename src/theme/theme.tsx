import React, { PropsWithChildren } from 'react';
import { DefaultTheme, Theme as NavTheme } from '@react-navigation/native';
import { colors } from './colors';
import { ThemeProvider as BaseThemeProvider, useTheme, ThemeName } from '../../theme';

// Re-export useTheme for convenience
export { useTheme };

// Custom theme colors for app screens (includes all keys)
export const themeColors = {
  ...colors,
};

// Navigation theme
export const navTheme: NavTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.bg,
    card: colors.card,
    text: colors.text,
    border: colors.line,
    primary: colors.accent,
    notification: colors.neon,
  },
};

// Map theme name to background images
export const backgroundAssets: Record<ThemeName, number> = {
  Void: require('../../assets/bg-void.png'),
  NeonFlux: require('../../assets/bg-neon.png'),
  Astral: require('../../assets/bg-astral.png'),
};

// Base theme provider wrapper
export function ThemeProvider({ children }: PropsWithChildren<{}>) {
  return <BaseThemeProvider>{children}</BaseThemeProvider>;
}
