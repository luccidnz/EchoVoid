// Custom theme colors for app screens (includes all keys)
export const themeColors = {
  ...colors,
};
import React, { PropsWithChildren } from 'react';
import { DefaultTheme, Theme as NavTheme } from '@react-navigation/native';
import { colors } from './colors';

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

import { ImageBackground, StyleSheet, View, Animated, Easing } from 'react-native';

export function ThemeProvider({ children }: PropsWithChildren) {

  return (
    <View style={{ flex: 1 }}>
      {/* Gradient background for astral/spiritual effect */}
      <View style={styles.gradientBg}>
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
    backgroundColor: '#2C1B0F', // lighter brown for better contrast
  },
  bg: { flex: 1, width: '100%', height: '100%', justifyContent: 'center', backgroundColor: '#2C1B0F' },
  overlay: { flex: 1, opacity: 0.08, justifyContent: 'center' }, // lower overlay opacity for brightness
});
