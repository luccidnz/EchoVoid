import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { useTheme } from '../../theme';
import { SPACING } from '../../src/theme/spacing';
import { FONT_WEIGHTS } from '../../src/theme/typography';
export default function EVoidSlider({ value, onChange, min = 0, max = 1, step = 0.01, label, format }: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  format?: string;
}) {
  const { theme } = useTheme();
  return (
    <View style={styles.wrap}>
      {label && <Text style={[styles.label, { color: theme.colors.text }]}>{label}</Text>}
      <Slider
        value={value}
        onValueChange={onChange}
        minimumValue={min}
        maximumValue={max}
        step={step}
        minimumTrackTintColor={theme.colors.accent}
        maximumTrackTintColor={theme.colors.surface}
        thumbTintColor={theme.colors.primary}
        style={styles.slider}
      />
      <Text style={[styles.value, { color: theme.colors.accent }]}>{value}{format}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  wrap: { width: '100%', marginVertical: SPACING.sm },
  label: { marginBottom: SPACING.xs, fontWeight: FONT_WEIGHTS.semibold },
  slider: { width: '100%' },
  value: { fontWeight: FONT_WEIGHTS.bold, fontSize: 15, marginTop: SPACING.xxs },
});
