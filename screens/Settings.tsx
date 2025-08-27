import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme, themes, ThemeName } from '../theme';
import Chip from '../components/controls/Chip';
import EVoidToggle from '../components/ui/EVoidToggle';
import { usePrefs } from '../hooks/usePrefs';

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const [haptics, setHaptics] = usePrefs('haptics', true);
  return (
    <View style={[styles.flex, { backgroundColor: theme.colors.bg }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Settings</Text>
      <Text style={[styles.label, { color: theme.colors.text }]}>Theme</Text>
      <Chip
        options={Object.keys(themes) as ThemeName[]}
        value={theme.name}
        onChange={v => setTheme(v as ThemeName)}
      />
      <EVoidToggle
        label="Haptic Feedback"
        value={haptics}
        onValueChange={setHaptics}
      />
      <Text style={[styles.label, { color: theme.colors.text }]}>Audio FX (coming soon)</Text>
      <Text style={[styles.label, { color: theme.colors.text }]}>Performance (coming soon)</Text>
      <Text style={[styles.label, { color: theme.colors.text }]}>Privacy (coming soon)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, padding: 24 },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 24 },
  label: { fontSize: 16, fontWeight: '600', marginTop: 18 },
});
