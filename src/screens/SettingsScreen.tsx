import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { SPACING } from '../theme/spacing';
import { FONT_SIZES, FONT_WEIGHTS } from '../theme/typography';

export default function SettingsScreen({ navigation }: { navigation: any }) {
  // Log navigation prop
  console.log('[SettingsScreen] navigation prop:', navigation);

  return (
    <LinearGradient colors={[colors.bg, '#0A0A1C', colors.card]} style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.h1}>Settings</Text>
        <Text style={styles.p}>(Add prefs like voice, theme, logging here)</Text>
      </View>
    </LinearGradient>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.lg },
  h1: { color: colors.text, fontSize: FONT_SIZES.xxxl, fontWeight: FONT_WEIGHTS.bold },
  p: { color: colors.subtext, marginTop: SPACING.sm },
});
