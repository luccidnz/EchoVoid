import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { useTheme, Theme } from '../../theme';

export default function SettingsScreen({ navigation }: { navigation: any }) {
  // Log navigation prop
  console.log('[SettingsScreen] navigation prop:', navigation);
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <LinearGradient colors={[colors.bg, '#0A0A1C', colors.card]} style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.h1}>Settings</Text>
        <Text style={styles.p}>(Add prefs like voice, theme, logging here)</Text>
      </View>
    </LinearGradient>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
    h1: { ...theme.typography.heading1, color: colors.text },
    p: { ...theme.typography.body, color: colors.subtext, marginTop: 8 },
  });
}
