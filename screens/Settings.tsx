import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme, themes, ThemeName, Theme } from '../theme';
import Chip from '../components/controls/Chip';

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const styles = createStyles(theme);
  return (
    <View style={[styles.flex, { backgroundColor: theme.colors.bg }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Settings</Text>
      <Text style={[styles.label, { color: theme.colors.text }]}>Theme</Text>
      <Chip
        options={Object.keys(themes) as ThemeName[]}
        value={theme.name}
        onChange={v => setTheme(v as ThemeName)}
      />
      <Text style={[styles.label, { color: theme.colors.text }]}>Audio FX (coming soon)</Text>
      <Text style={[styles.label, { color: theme.colors.text }]}>Performance (coming soon)</Text>
      <Text style={[styles.label, { color: theme.colors.text }]}>Privacy (coming soon)</Text>
    </View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    flex: { flex: 1, padding: 24 },
    title: { ...theme.typography.heading1, marginBottom: 24 },
    label: { ...theme.typography.label, marginTop: 18 },
  });
}
