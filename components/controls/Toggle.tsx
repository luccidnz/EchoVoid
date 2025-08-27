import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';
export default function Toggle({ value, onChange, label }: {
  value: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  const { theme } = useTheme();
  return (
    <View style={styles.row}>
      {label && <Text style={[styles.label, { color: theme.colors.text }]}>{label}</Text>}
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ true: theme.colors.accent, false: theme.colors.surface }}
        thumbColor={value ? theme.colors.primary : theme.colors.surface}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginVertical: 8 },
  label: { marginRight: 12, fontWeight: '600' },
});
