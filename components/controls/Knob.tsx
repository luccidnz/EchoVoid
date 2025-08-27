import React, { useRef } from 'react';
import { View, Text, PanResponder, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedProps, withSpring } from 'react-native-reanimated';
import Svg, { Circle, G, Path as SvgPath } from 'react-native-svg';
import { useTheme } from '../../theme';
import { scaleFont } from 'src/utils/scale';
const TICK_COUNT = 18;

function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
  const a = ((angle - 90) * Math.PI) / 180.0;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return [
    'M', start.x, start.y,
    'A', r, r, 0, largeArcFlag, 0, end.x, end.y
  ].join(' ');
}

export default function Knob({ value, onChange, min = 0, max = 1, step = 0.01, size = 80, label, format }: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  size?: number;
  label?: string;
  format?: string;
}) {
  const { theme } = useTheme();
  const angleRange = 270;
  const startAngle = 135;
  const endAngle = 405;
  const radius = size / 2 - 10;
  const center = size / 2;
  const percent = (value - min) / (max - min);
  const angle = startAngle + percent * angleRange;

  // Animate value
  const animatedValue = useSharedValue(percent);
  React.useEffect(() => {
    animatedValue.value = withSpring(percent, { damping: 18 });
  }, [percent]);
  const AnimatedPath = Animated.createAnimatedComponent(SvgPath);
  const animatedProps = useAnimatedProps(() => {
    const a = startAngle + animatedValue.value * angleRange;
    return { d: describeArc(center, center, radius, startAngle, a) };
  });

  // PanResponder for knob drag
  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, g) => {
        const dx = g.moveX - g.x0;
        const dy = g.moveY - g.y0;
        const theta = Math.atan2(center - (g.moveY - g.y0 + center), (g.moveX - g.x0 + center) - center);
        let deg = (theta * 180) / Math.PI + 180;
        deg = Math.max(startAngle, Math.min(endAngle, deg));
        const p = (deg - startAngle) / angleRange;
        const v = min + p * (max - min);
        onChange(Math.round(v / step) * step);
      },
    })
  ).current;

  return (
    <View style={{ alignItems: 'center' }}>
      <View {...pan.panHandlers}>
        <Svg width={size} height={size}>
          {/* Arc background */}
          <SvgPath d={describeArc(center, center, radius, startAngle, endAngle)} stroke={theme.colors.surface} strokeWidth={7} fill="none" />
          {/* Arc value */}
          <AnimatedPath animatedProps={animatedProps} stroke={theme.colors.accent} strokeWidth={7} fill="none" />
          {/* Tick marks */}
          <G>
            {Array.from({ length: TICK_COUNT }).map((_, i) => {
              const a = startAngle + (i / (TICK_COUNT - 1)) * angleRange;
              const outer = polarToCartesian(center, center, radius + 6, a);
              const inner = polarToCartesian(center, center, radius - 6, a);
              return <SvgPath key={i} d={`M${inner.x},${inner.y}L${outer.x},${outer.y}`} stroke={theme.colors.accent} strokeWidth={2} />;
            })}
          </G>
          {/* Knob center */}
          <Circle cx={center} cy={center} r={radius - 16} fill="#181A22" />
        </Svg>
      </View>
      {label && <Text style={[styles.label, { color: theme.colors.text }]}>{label}</Text>}
      <Text style={[styles.value, { color: theme.colors.accent }]}>{value}{format}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  label: { fontWeight: '600', marginTop: 2 },
  value: { fontWeight: '700', fontSize: scaleFont(16) },
});
