import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme, Theme } from '../../theme';

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
  const styles = createStyles(theme);
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

function createStyles(theme: Theme) {
  return StyleSheet.create({
    btn: { paddingVertical: 14, paddingHorizontal: 20, borderRadius: 14, alignItems: 'center', marginVertical: 4 },
    text: { ...theme.typography.button },
  });
}
