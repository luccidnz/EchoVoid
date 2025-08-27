import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme, themes, ThemeName } from '../theme';
import Chip from '../components/controls/Chip';
import { useDesignSystem } from '../theme/designSystem';

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { spacing, typography } = useDesignSystem();
  const styles = StyleSheet.create({
    flex: { flex: 1, padding: spacing.xxl, backgroundColor: theme.colors.bg },
    title: { ...typography.h1, color: theme.colors.text, marginBottom: spacing.xxl },
    label: { ...typography.label, color: theme.colors.text, marginTop: spacing.xl },
  });
  return (
    <View style={styles.flex}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.label}>Theme</Text>
      <Chip
        options={Object.keys(themes) as ThemeName[]}
        value={theme.name}
        onChange={v => setTheme(v as ThemeName)}
      />
      <Text style={styles.label}>Audio FX (coming soon)</Text>
      <Text style={styles.label}>Performance (coming soon)</Text>
      <Text style={styles.label}>Privacy (coming soon)</Text>
    </View>
  );
}
