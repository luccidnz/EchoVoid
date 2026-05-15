// Custom theme colors for app screens (includes all keys)
export const themeColors = {
  ...colors,
};
import React, { PropsWithChildren } from 'react';
import { DefaultTheme, Theme as NavTheme } from '@react-navigation/native';
import { colors } from './colors';
import { useTheme } from '../../theme';

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

import { StyleSheet, View } from 'react-native';

export function ThemeProvider({ children }: PropsWithChildren) {
  const { theme } = useTheme();
  return (
    <View style={{ flex: 1 }}>
      {/* Gradient background for astral/spiritual effect */}
      <View style={[styles.gradientBg, { backgroundColor: theme.colors.bg }]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  gradientBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
});
