import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';

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
      style={({ pressed, focused }) => [
        styles.btn,
        variant === 'outline' && { backgroundColor: 'transparent', borderColor: theme.colors.accent },
        variant === 'ghost' && { backgroundColor: 'transparent', borderWidth: 0 },
        {
          backgroundColor: variant === 'solid' ? theme.colors.primary : 'transparent',
          borderColor: theme.name === 'HighContrast' ? theme.colors.text : theme.colors.accent,
          borderWidth: theme.name === 'HighContrast' ? 3 : variant === 'outline' ? 2 : 0,
        },
        focused && theme.name === 'HighContrast' && { borderColor: theme.colors.accent },
        pressed && !disabled && { opacity: 0.8 },
        disabled && { opacity: 0.5 },
        style,
      ]}
      pointerEvents={disabled ? 'none' : 'auto'}
      accessibilityState={{ disabled }}
    >
      <Text style={[theme.typography.body, styles.text, { color: theme.colors.text }]}>{label}</Text>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  btn: { paddingVertical: 14, paddingHorizontal: 20, borderRadius: 14, alignItems: 'center', marginVertical: 4 },
  text: { letterSpacing: 0.4 },
});
