import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Slider from '@react-native-community/slider';
import { useTheme } from '../../theme';
import { useDesignSystem } from '../../theme/designSystem';

type Props = { value: number; onValueChange: (v: number) => void; min?: number; max?: number; step?: number; label?: string };
export default function EVoidSlider({ value, onValueChange, min = 0, max = 1, step = 0.01, label }: Props) {
  const { theme } = useTheme();
  const { spacing, typography } = useDesignSystem();
  const styles = StyleSheet.create({
    wrap: { width: '100%', marginVertical: spacing.sm },
    label: { ...typography.label, marginBottom: spacing.xs },
    slider: { width: '100%' },
  });
  return (
    <View style={styles.wrap}>
      {label && <Text style={[styles.label, { color: theme.colors.text }]}>{label}</Text>}
      <Slider
        value={value}
        onValueChange={onValueChange}
        minimumValue={min}
        maximumValue={max}
        step={step}
        minimumTrackTintColor={theme.colors.accent}
        maximumTrackTintColor={theme.colors.surface}
        thumbTintColor={theme.colors.primary}
        style={styles.slider}
      />
    </View>
  );
}
