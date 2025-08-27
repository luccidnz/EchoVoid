import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Slider from '@react-native-community/slider';
import { useTheme } from '../../theme';

type Props = { value: number; onValueChange: (v: number) => void; min?: number; max?: number; step?: number; label?: string };
export default function EVoidSlider({ value, onValueChange, min = 0, max = 1, step = 0.01, label }: Props) {
  const { theme } = useTheme();
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
const styles = StyleSheet.create({
  wrap: { width: '100%', marginVertical: 8 },
  label: { marginBottom: 4, fontWeight: '600' },
  slider: { width: '100%' },
});
