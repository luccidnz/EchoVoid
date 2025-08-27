import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';
import { scaleFont } from 'src/utils/scale';

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
  timer: { fontSize: scaleFont(22), fontWeight: '700', letterSpacing: 1, color: '#fff', textAlign: 'center' },
});
