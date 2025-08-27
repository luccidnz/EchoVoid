import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';
import { SPACING } from '../../src/theme/spacing';
import { FONT_SIZES, FONT_WEIGHTS } from '../../src/theme/typography';
export default function Chip({ options, value, onChange }: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  const { theme } = useTheme();
  return (
    <View style={styles.row}>
      {options.map(opt => (
        <Pressable
          key={opt}
          onPress={() => onChange(opt)}
          style={[styles.chip, { backgroundColor: value === opt ? theme.colors.accent : theme.colors.surface }]}
        >
          <Text style={[styles.text, { color: value === opt ? theme.colors.bg : theme.colors.text }]}>{opt}</Text>
        </Pressable>
      ))}
    </View>
  );
}
const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: SPACING.sm, marginVertical: SPACING.sm },
  chip: {
    paddingVertical: SPACING.sm - SPACING.xxs,
    paddingHorizontal: SPACING.sm + SPACING.xs + SPACING.xxs,
    borderRadius: SPACING.md,
    margin: SPACING.xxs,
  },
  text: { fontWeight: FONT_WEIGHTS.semibold, fontSize: FONT_SIZES.sm },
});
