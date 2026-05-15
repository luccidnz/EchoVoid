import React, { useRef } from 'react';
import { Switch, Text, StyleSheet, Animated, Pressable } from 'react-native';
import { useTheme } from '../../theme';

type Props = { value: boolean; onValueChange: (v: boolean) => void; label?: string };
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function EVoidToggle({ value, onValueChange, label }: Props) {
  const { theme } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0.8, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const toggle = () => onValueChange(!value);

  return (
    <AnimatedPressable
      onPress={toggle}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.row, { transform: [{ scale }], opacity }]}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
    >
      {label && <Text style={[styles.label, { color: theme.colors.text }]}>{label}</Text>}
      <Switch
        value={value}
        trackColor={{ true: theme.colors.accent, false: theme.colors.surface }}
        thumbColor={value ? theme.colors.primary : theme.colors.surface}
        pointerEvents="none"
      />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginVertical: 8 },
  label: { marginRight: 12, fontWeight: '600' },
});
