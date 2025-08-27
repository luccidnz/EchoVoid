import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';
import { SPACING } from '../../src/theme/spacing';
import { FONT_SIZES, FONT_WEIGHTS } from '../../src/theme/typography';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'solid' | 'outline' | 'ghost';
  style?: ViewStyle | ViewStyle[];
  testID?: string;
  disabled?: boolean;
};

export default function EVoidButton({ label, onPress, variant = 'solid', style, testID, disabled = false }: Props) {
  const { theme } = useTheme();
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      hitSlop={12}
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [
        styles.btn,
        variant === 'outline' && { backgroundColor: 'transparent', borderColor: theme.colors.accent, borderWidth: 2 },
        variant === 'ghost' && { backgroundColor: 'transparent', borderWidth: 0 },
        { backgroundColor: variant === 'solid' ? theme.colors.primary : 'transparent' },
        pressed && !disabled && { opacity: 0.8 },
        disabled && { opacity: 0.5 },
        style,
      ]}
      pointerEvents={disabled ? 'none' : 'auto'}
      accessibilityState={{ disabled }}
    >
      <Text style={[styles.text, { color: theme.colors.text }]}>{label}</Text>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  btn: {
    paddingVertical: SPACING.sm + SPACING.xs + SPACING.xxs,
    paddingHorizontal: SPACING.md + SPACING.xs,
    borderRadius: SPACING.sm + SPACING.xs + SPACING.xxs,
    alignItems: 'center',
    marginVertical: SPACING.xs,
  },
  text: { fontSize: FONT_SIZES.md, fontWeight: FONT_WEIGHTS.bold, letterSpacing: 0.4 },
});
