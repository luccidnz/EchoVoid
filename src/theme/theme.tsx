import React, { createContext, useContext, useState, PropsWithChildren } from 'react';
import { View } from 'react-native';
import { DefaultTheme, Theme as NavTheme } from '@react-navigation/native';
import { colors as baseColors } from './colors';
import { highContrastColors } from './variants/highContrast';

export type ThemeVariant = 'default' | 'highContrast';

export interface Theme {
  colors: typeof baseColors;
  navTheme: NavTheme;
}

const createNavTheme = (c: typeof baseColors): NavTheme => ({
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: c.bg,
    card: c.card,
    text: c.text,
    border: c.line,
    primary: c.accent,
    notification: c.neon,
  },
});

const defaultTheme: Theme = {
  colors: baseColors,
  navTheme: createNavTheme(baseColors),
};

const hcColors = highContrastColors;
const highContrast: Theme = {
  colors: hcColors,
  navTheme: createNavTheme(hcColors),
};

export const themes: Record<ThemeVariant, Theme> = {
  default: defaultTheme,
  highContrast,
};

// Backwards compatibility exports
export const themeColors = themes.default.colors;
export const navTheme = themes.default.navTheme;

interface ThemeContextType {
  variant: ThemeVariant;
  theme: Theme;
  setVariant: (v: ThemeVariant) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  variant: 'default',
  theme: themes.default,
  setVariant: () => {},
});

export function ThemeProvider({ children }: PropsWithChildren) {
  const [variant, setVariant] = useState<ThemeVariant>('default');
  const theme = themes[variant];

  return (
    <ThemeContext.Provider value={{ variant, theme, setVariant }}>
      <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>{children}</View>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
