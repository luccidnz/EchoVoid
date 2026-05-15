import React, { useRef } from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, Animated } from 'react-native';
import HapticFeedback from 'react-native-haptic-feedback';
import { prefs } from '../../hooks/usePrefs';
import { useTheme } from '../../theme';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'solid' | 'outline' | 'ghost';
  style?: ViewStyle | ViewStyle[];
  testID?: string;
  disabled?: boolean;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function EVoidButton({ label, onPress, variant = 'solid', style, testID, disabled = false }: Props) {
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

  const handlePress = () => {
    if (prefs.get('haptics', true)) {
      HapticFeedback.trigger('impactMedium');
    }
    onPress();
  };

  return (
    <AnimatedPressable
      testID={testID}
      accessibilityRole="button"
      hitSlop={12}
      onPress={disabled ? undefined : handlePress}
      onPressIn={disabled ? undefined : handlePressIn}
      onPressOut={disabled ? undefined : handlePressOut}
      style={[
        styles.btn,
        variant === 'outline' && { backgroundColor: 'transparent', borderColor: theme.colors.accent, borderWidth: 2 },
        variant === 'ghost' && { backgroundColor: 'transparent', borderWidth: 0 },
        { backgroundColor: variant === 'solid' ? theme.colors.primary : 'transparent' },
        { transform: [{ scale }], opacity },
        style,
        disabled && { opacity: 0.5 },
      ]}
      pointerEvents={disabled ? 'none' : 'auto'}
      accessibilityState={{ disabled }}
    >
      <Text style={[styles.text, { color: theme.colors.text }]}>{label}</Text>
    </AnimatedPressable>
  );
}
const styles = StyleSheet.create({
  btn: { paddingVertical: 14, paddingHorizontal: 20, borderRadius: 14, alignItems: 'center', marginVertical: 4 },
  text: { fontSize: 16, fontWeight: '700', letterSpacing: 0.4 },
});
