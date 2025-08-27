import React from 'react';
import { View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';

// Accepts PCM buckets as prop, fallback to random demo
export default function SpectrogramThumb({ buckets }: { buckets?: number[] }) {
  const width = 80, height = 32;
  const bars = buckets && buckets.length > 0 ? buckets : Array.from({ length: 24 }, () => Math.random());
  return (
    <View style={{ width, height, backgroundColor: '#222', borderRadius: 6, overflow: 'hidden' }}>
      <Svg width={width} height={height}>
        {bars.map((v, i) => (
          <Rect
            key={i}
            x={i * (width / bars.length)}
            y={height - v * height}
            width={width / bars.length - 1}
            height={v * height}
            fill={`rgba(0,224,255,${0.18 + v * 0.5})`}
          />
        ))}
      </Svg>
    </View>
  );
}
