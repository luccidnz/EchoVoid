import React, { useRef } from 'react';
import { View, StyleSheet, PanResponder, Text, GestureResponderEvent, PanResponderGestureState } from 'react-native';
import { useTheme } from '../../theme';
import Svg, { Line, Circle as SvgCircle } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedProps, withSpring } from 'react-native-reanimated';

const PAD_SIZE = 120;

export default function XYPad({ x, y, onChange, label }: {
  x: number;
  y: number;
  onChange: (x: number, y: number) => void;
  label?: string;
}) {
  const { theme } = useTheme();
  const thumbX = useSharedValue(x * PAD_SIZE);
  const thumbY = useSharedValue(y * PAD_SIZE);
  // Ensure robust animations and interactions
  React.useEffect(() => {
    thumbX.value = withSpring(x * PAD_SIZE, { damping: 18 });
    thumbY.value = withSpring(y * PAD_SIZE, { damping: 18 });
  }, [x, y]);
  const handlePanResponderMove = (_: GestureResponderEvent, g: PanResponderGestureState) => {
    let px = Math.max(0, Math.min(1, g.moveX / PAD_SIZE));
    let py = Math.max(0, Math.min(1, g.moveY / PAD_SIZE));
    onChange(px, py);
  };
  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: handlePanResponderMove,
    })
  ).current;
  const AnimatedCircle = Animated.createAnimatedComponent(SvgCircle);
  const animatedProps = useAnimatedProps(() => ({
    cx: thumbX.value,
    cy: thumbY.value,
  }));
  return (
    <View style={styles.wrap}>
      {label && <Text style={[styles.label, { color: theme.colors.text }]}>{label}</Text>}
      <View {...pan.panHandlers} style={[styles.pad, { backgroundColor: theme.colors.surface, borderColor: theme.colors.accent }]}> 
        <Svg width={PAD_SIZE} height={PAD_SIZE} style={StyleSheet.absoluteFill}>
          {/* Grid */}
          {[0.25, 0.5, 0.75].map((f, i) => (
            <Line key={i} x1={f * PAD_SIZE} y1={0} x2={f * PAD_SIZE} y2={PAD_SIZE} stroke={theme.colors.accent} strokeWidth={0.5} />
          ))}
          {[0.25, 0.5, 0.75].map((f, i) => (
            <Line key={i+4} x1={0} y1={f * PAD_SIZE} x2={PAD_SIZE} y2={f * PAD_SIZE} stroke={theme.colors.accent} strokeWidth={0.5} />
          ))}
          {/* Animated thumb */}
          <AnimatedCircle animatedProps={animatedProps} r={12} fill={theme.colors.accent} opacity={0.7} />
        </Svg>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  wrap: { marginVertical: 8 },
  label: { marginBottom: 4, fontWeight: '600' },
  pad: { width: PAD_SIZE, height: PAD_SIZE, borderRadius: 16, borderWidth: 2, overflow: 'hidden' },
});
