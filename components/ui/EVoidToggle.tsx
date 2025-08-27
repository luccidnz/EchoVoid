import React from 'react';
import { Switch, View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useTheme } from '../../theme';

type Props = { value: boolean; onValueChange: (v: boolean) => void; label?: string };
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function EVoidToggle({ value, onValueChange, label }: Props) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  return (
    <View style={styles.row}>
      {label && <Text style={[styles.label, { color: theme.colors.text }]}>{label}</Text>}
      <AnimatedPressable
        onPress={() => onValueChange(!value)}
        onPressIn={() => (scale.value = withTiming(0.95, { duration: 100 }))}
        onPressOut={() => (scale.value = withTiming(1, { duration: 100 }))}
        onHoverIn={() => (scale.value = withTiming(1.05, { duration: 150 }))}
        onHoverOut={() => (scale.value = withTiming(1, { duration: 150 }))}
        accessibilityRole="switch"
        accessibilityState={{ checked: value }}
      >
        <Animated.View style={animatedStyle}>
          <Switch
            pointerEvents="none"
            value={value}
            trackColor={{ true: theme.colors.accent, false: theme.colors.surface }}
            thumbColor={value ? theme.colors.primary : theme.colors.surface}
          />
        </Animated.View>
      </AnimatedPressable>
    </View>
  );
}
const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginVertical: 8 },
  label: { marginRight: 12, fontWeight: '600' },
});
