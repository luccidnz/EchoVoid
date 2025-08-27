import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

interface AudioReactiveBarsProps {
  rms?: number;
  barCount?: number;
  colors?: string[];
}

/**
 * Animated bar visualizer with optional particle burst and simple 3D depth
 * illusion. Animations are handled on the UI thread via Reanimated to keep
 * performance smooth on mid-tier devices.
 */
export default function AudioReactiveBars({
  rms = 0.2,
  barCount = 16,
  colors = ['#00E0FF', '#FF00E0'],
}: AudioReactiveBarsProps) {
  const [barHeights, setBarHeights] = useState<number[]>(
    () => Array(barCount).fill(0),
  );

  const generateBarHeights = useCallback(
    () => Array.from({ length: barCount }, () => Math.random()),
    [barCount],
  );

  // Update heights periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const start = performance.now();
      const vals = generateBarHeights();
      setBarHeights(vals);
      // Dev-only perf logging
      if (__DEV__) {
        const duration = performance.now() - start;
        if (duration > 5) {
          console.log('AudioReactiveBars update took', duration.toFixed(2), 'ms');
        }
      }
    }, 100);
    return () => clearInterval(interval);
  }, [generateBarHeights]);

  const colorPairs = useMemo(() => {
    if (colors.length >= 2) return colors;
    return [colors[0], colors[0]];
  }, [colors]);

  return (
    <View
      style={{
        height: 80,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
    >
      {barHeights.map((barRms, i) => (
        <Bar
          key={i}
          index={i}
          rms={barRms}
          total={barCount}
          colors={colorPairs}
        />
      ))}
    </View>
  );
}

interface BarProps {
  index: number;
  rms: number;
  total: number;
  colors: string[];
}

function Bar({ index, rms, total, colors }: BarProps) {
  const height = useSharedValue(10);
  const colorProg = useSharedValue(rms);
  const particle = useSharedValue(0);

  useEffect(() => {
    height.value = withTiming(10 + rms * 60, { duration: 120 });
    colorProg.value = withTiming(rms, { duration: 200 });
    if (rms > 0.8) {
      particle.value = 1;
      particle.value = withTiming(0, { duration: 300 });
    }
  }, [rms]);

  const barStyle = useAnimatedStyle(() => {
    const depth = 0.8 + Math.cos((index / total) * Math.PI) * 0.4; // center bars appear closer
    return {
      height: height.value,
      marginHorizontal: 2,
      borderRadius: 4,
      width: 8 * depth,
      backgroundColor: interpolateColor(
        colorProg.value,
        [0, 1],
        colors,
      ),
      transform: [{ perspective: 400 }, { scaleY: depth }],
    };
  });

  const particleStyle = useAnimatedStyle(() => ({
    opacity: particle.value,
    transform: [{ translateY: -height.value }, { scale: 1 + particle.value }],
  }));

  return (
    <View
      style={{
        position: 'relative',
        justifyContent: 'flex-end',
        alignItems: 'center',
      }}
    >
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: colors[1],
          },
          particleStyle,
        ]}
      />
      <Animated.View style={barStyle} />
    </View>
  );
}

