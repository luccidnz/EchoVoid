import React, { useEffect } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

/**
 * Animated gradient background that gently rotates to give the app a portal-like feel.
 * This component is rendered absolutely and never intercepts touches.
 */
export default function PortalBackground() {
  const rotation = useSharedValue(0);

  useEffect(() => {
    // rotate indefinitely for a subtle moving background
    rotation.value = withRepeat(
      withTiming(360, { duration: 20000, easing: Easing.linear }),
      -1,
      false,
    );
  }, [rotation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const size = Math.max(
    Dimensions.get('window').width,
    Dimensions.get('window').height,
  ) * 1.5;

  return (
    <Animated.View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, styles.center, animatedStyle]}
    >
      <LinearGradient
        colors={['rgba(59,130,246,0.2)', 'rgba(147,51,234,0.4)', 'transparent']}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        start={{ x: 0.2, y: 0.2 }}
        end={{ x: 0.8, y: 0.8 }}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

