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
    primary: colors.tohunga,
    notification: colors.neon,
  },
};

import { ImageBackground, StyleSheet, View } from 'react-native';
import ParticleField from '../../components/fx/ParticleField';
import NoiseOverlay from '../../components/fx/NoiseOverlay';

export function ThemeProvider({ children }: PropsWithChildren) {
  return (
    <ImageBackground
      source={require('../../assets/bg-astral.png')}
      style={styles.bg}
      resizeMode="cover"
    >
      <ParticleField />
      <NoiseOverlay />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.tohunga, opacity: 0.05 }]} />
      {children}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, width: '100%', height: '100%' },
});
