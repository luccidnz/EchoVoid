import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme, ThemeName } from '../theme';
import Chip from '../components/controls/Chip';

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const themeOptions: ThemeName[] = ['Void', 'NeonFlux', 'Astral', 'HighContrast'];
  return (
    <View style={[styles.flex, { backgroundColor: theme.colors.bg }]}>
      <Text style={[theme.typography.title, styles.title, { color: theme.colors.text }]}>Settings</Text>
      <Text style={[theme.typography.label, styles.label, { color: theme.colors.text }]}>Theme</Text>
      <Chip
        options={themeOptions}
        value={theme.name}
        onChange={v => setTheme(v as ThemeName)}
      />
      <Text style={[theme.typography.label, styles.label, { color: theme.colors.text }]}>Audio FX (coming soon)</Text>
      <Text style={[theme.typography.label, styles.label, { color: theme.colors.text }]}>Performance (coming soon)</Text>
      <Text style={[theme.typography.label, styles.label, { color: theme.colors.text }]}>Privacy (coming soon)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, padding: 24 },
  title: { marginBottom: 24 },
  label: { marginTop: 18 },
});
