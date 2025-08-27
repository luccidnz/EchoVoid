import React from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedProps, withRepeat, withTiming } from 'react-native-reanimated';
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const AnimatedRect = Animated.createAnimatedComponent(Rect);

export default function NoiseOverlay() {
  // Animate opacity for a subtle flicker
  const opacity = useSharedValue(0.08);
  React.useEffect(() => {
    opacity.value = withRepeat(withTiming(0.16, { duration: 600 }), -1, true);
  }, []);
  const animatedProps = useAnimatedProps(() => ({
    opacity: opacity.value,
  }));
  return (
    <Svg pointerEvents="none" style={StyleSheet.absoluteFill} width={width} height={height}>
      <AnimatedRect animatedProps={animatedProps} x={0} y={0} width={width} height={height} fill="#fff" />
    </Svg>
  );
}
