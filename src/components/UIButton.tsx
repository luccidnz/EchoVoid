import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme, Theme } from '../../theme';

type Props = {
  label: string;
  onPress: () => void;
  style?: ViewStyle | ViewStyle[];
  testID?: string;
};

export default function UIButton({ label, onPress, style, testID }: Props) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
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

function createStyles(theme: Theme) {
  return StyleSheet.create({
    btn: {
      paddingVertical: 14,
      paddingHorizontal: 20,
      borderRadius: 14,
      backgroundColor: '#111827',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.10)',
    },
    text: { ...theme.typography.button, color: theme.colors.text },
  });
}
