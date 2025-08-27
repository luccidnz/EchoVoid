import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

export default function VU({ value, peak }: { value: number; peak?: number }) {
  const { theme } = useTheme();
  const barHeight = useSharedValue(Math.max(8, value * 100));
  React.useEffect(() => {
    barHeight.value = withTiming(Math.max(8, value * 100), { duration: 120 });
  }, [value]);
  const barStyle = useAnimatedStyle(() => ({
    height: barHeight.value,
    backgroundColor: theme.colors.accent,
  }));
  const peakPos = useSharedValue(peak !== undefined ? peak * 100 : 0);
  React.useEffect(() => {
    if (peak !== undefined) {
      peakPos.value = withTiming(peak * 100, { duration: 200 });
    }
  }, [peak]);
  const peakStyle = useAnimatedStyle(() => ({
    bottom: peakPos.value,
    backgroundColor: theme.colors.danger,
  }));
  return (
    <View style={styles.wrap}>
      <Animated.View style={[styles.bar, barStyle]} />
      {peak !== undefined && <Animated.View style={[styles.peak, peakStyle]} />}
    </View>
  );
}
const styles = StyleSheet.create({
  wrap: { width: 18, height: 120, backgroundColor: '#222', borderRadius: 8, justifyContent: 'flex-end', margin: 8 },
  bar: { width: 18, borderRadius: 8 },
  peak: { position: 'absolute', left: 0, width: 18, height: 4, borderRadius: 2 },
});
