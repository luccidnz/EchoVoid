import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { useTheme, themes, ThemeName } from '../../theme';
import Chip from '../../components/controls/Chip';
import { scaleFont } from 'src/utils/scale';

export default function SettingsScreen() {
  const { theme, setTheme, highContrast, setHighContrast } = useTheme();
  return (
    <View style={[styles.flex, { backgroundColor: theme.colors.bg }]}> 
      <Text style={[styles.title, { color: theme.colors.text }]}>Settings</Text>
      <Text style={[styles.label, { color: theme.colors.text }]}>Theme</Text>
      <Chip options={Object.keys(themes) as ThemeName[]} value={theme.name} onChange={v => setTheme(v as ThemeName)} />
        <View style={styles.row}>
          <Text style={[styles.label, { color: theme.colors.text }]}>High Contrast</Text>
          <Switch value={highContrast} onValueChange={setHighContrast} accessibilityLabel="High Contrast" />
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, padding: 24 },
  title: { fontSize: scaleFont(28), fontWeight: '800', marginBottom: 24 },
  label: { fontSize: scaleFont(16), fontWeight: '600', marginTop: 18 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 },
});
