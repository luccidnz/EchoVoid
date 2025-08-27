import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Toggle from '../components/Toggle';
import { useTheme } from '../theme/theme';

export default function SettingsScreen({ navigation }: { navigation: any }) {
  // Log navigation prop
  console.log('[SettingsScreen] navigation prop:', navigation);
  const { variant, setVariant, theme } = useTheme();
  const { colors } = theme;

  return (
    <LinearGradient colors={[colors.bg, colors.bg, colors.card]} style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={[styles.h1, { color: colors.text }]}>Settings</Text>
        <Text style={[styles.p, { color: colors.subtext }]}> (Add prefs like voice, theme, logging here)</Text>
        <View style={{ marginTop: 24, alignItems: 'center' }}>
          <Text style={[styles.h2, { color: colors.text }]}>Theme</Text>
          <View style={{ flexDirection: 'row', marginTop: 8 }}>
            <Toggle label="Default" active={variant === 'default'} onPress={() => setVariant('default')} />
            <Toggle label="High Contrast" active={variant === 'highContrast'} onPress={() => setVariant('highContrast')} />
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  h1: { fontSize: 28, fontWeight: '700' },
  h2: { fontSize: 20, fontWeight: '600' },
  p: { marginTop: 8 },
});
