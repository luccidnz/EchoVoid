import React from 'react';
import { Switch, View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';
import { useDesignSystem } from '../../theme/designSystem';

type Props = { value: boolean; onValueChange: (v: boolean) => void; label?: string };
export default function EVoidToggle({ value, onValueChange, label }: Props) {
  const { theme } = useTheme();
  const { spacing, typography } = useDesignSystem();
  const styles = StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', marginVertical: spacing.sm },
    label: { ...typography.label, marginRight: spacing.md },
  });
  return (
    <View style={styles.row}>
      {label && <Text style={[styles.label, { color: theme.colors.text }]}>{label}</Text>}
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ true: theme.colors.accent, false: theme.colors.surface }}
        thumbColor={value ? theme.colors.primary : theme.colors.surface}
      />
    </View>
  );
}
