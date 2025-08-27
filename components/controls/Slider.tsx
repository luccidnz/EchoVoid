import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { useTheme } from '../../theme';
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
  wrap: { width: '100%', marginVertical: 8 },
  label: { marginBottom: 4, fontWeight: '600' },
  slider: { width: '100%' },
  value: { fontWeight: '700', fontSize: 15, marginTop: 2 },
});
