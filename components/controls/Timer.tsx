import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';
import { FONT_SIZES, FONT_WEIGHTS } from '../../src/theme/typography';
import { SPACING } from '../../src/theme/spacing';

export default function Timer({ ms }: { ms: number }) {
  const mm = Math.floor(ms / 60000).toString().padStart(2, '0');
  const ss = Math.floor((ms % 60000) / 1000).toString().padStart(2, '0');
  const scale = useSharedValue(1);
  React.useEffect(() => {
    scale.value = withRepeat(withTiming(1.08, { duration: 600 }), -1, true);
  }, []);
  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  return <Animated.Text style={[styles.timer, style]}>{mm}:{ss}</Animated.Text>;
}
const styles = StyleSheet.create({
  timer: { fontSize: FONT_SIZES.xl + SPACING.xxs, fontWeight: FONT_WEIGHTS.bold, letterSpacing: 1, color: '#fff', textAlign: 'center' },
});
