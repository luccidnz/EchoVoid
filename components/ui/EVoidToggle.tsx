import React from 'react';
import { Switch, View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';
import { scaleFont } from 'src/utils/scale';

type Props = { value: boolean; onValueChange: (v: boolean) => void; label?: string };
export default function EVoidToggle({ value, onValueChange, label }: Props) {
  const { theme } = useTheme();
  return (
    <View style={styles.row}>
      {label && <Text style={[styles.label, { color: theme.colors.text }]}>{label}</Text>}
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ true: theme.colors.accent, false: theme.colors.surface }}
        thumbColor={value ? theme.colors.primary : theme.colors.surface}
        accessibilityRole="switch"
        accessibilityLabel={label || 'toggle'}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginVertical: 8 },
  label: { marginRight: 12, fontWeight: '600', fontSize: scaleFont(14) },
});
