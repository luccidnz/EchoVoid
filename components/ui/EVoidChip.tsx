import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';
import { SPACING } from '../../src/theme/spacing';
import { FONT_SIZES, FONT_WEIGHTS } from '../../src/theme/typography';

type Props = { label: string; selected?: boolean; style?: ViewStyle | ViewStyle[] };
export default function EVoidChip({ label, selected, style }: Props) {
  const { theme } = useTheme();
  return (
    <View style={[styles.chip, { backgroundColor: selected ? theme.colors.accent : theme.colors.surface }, style]}>
      <Text style={[styles.text, { color: selected ? theme.colors.bg : theme.colors.text }]}>{label}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  chip: {
    paddingVertical: SPACING.sm - SPACING.xxs,
    paddingHorizontal: SPACING.sm + SPACING.xs + SPACING.xxs,
    borderRadius: SPACING.md,
    margin: SPACING.xs,
  },
  text: { fontWeight: FONT_WEIGHTS.semibold, fontSize: FONT_SIZES.sm },
});
