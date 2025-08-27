import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle } from 'react-native';
import { SPACING } from '../theme/spacing';
import { FONT_SIZES, FONT_WEIGHTS } from '../theme/typography';

type Props = {
  label: string;
  onPress: () => void;
  style?: ViewStyle | ViewStyle[];
  testID?: string;
};

export default function UIButton({ label, onPress, style, testID }: Props) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      hitSlop={12}
      onPress={() => {
        // Log button press
        console.log('[UIButton] Pressed:', label);
        onPress();
      }}
      style={({ pressed }) => [
        styles.btn,
        pressed && { transform: [{ scale: 0.98 }], opacity: 0.9 },
        style,
      ]}
    >
      <Text style={styles.text}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingVertical: SPACING.sm + SPACING.xs + SPACING.xxs,
    paddingHorizontal: SPACING.md + SPACING.xs,
    borderRadius: SPACING.sm + SPACING.xs + SPACING.xxs,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  text: {
    color: 'white',
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
    letterSpacing: 0.4,
  },
});
