import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';
import { useDesignSystem } from '../../theme/designSystem';

type Props = { label: string; selected?: boolean; style?: ViewStyle | ViewStyle[] };
export default function EVoidChip({ label, selected, style }: Props) {
  const { theme } = useTheme();
  const { spacing, typography } = useDesignSystem();
  const styles = StyleSheet.create({
    chip: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.lg,
      borderRadius: spacing.lg,
      margin: spacing.xs,
    },
    text: { ...typography.chip },
  });
  return (
    <View style={[styles.chip, { backgroundColor: selected ? theme.colors.accent : theme.colors.surface }, style]}>
      <Text style={[styles.text, { color: selected ? theme.colors.bg : theme.colors.text }]}>{label}</Text>
    </View>
  );
}
