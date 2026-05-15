import React from 'react';
import { View } from 'react-native';

export type SpectralWaterfallProps = {
  data: number[][];
  height?: number;
};

// Renders a simple waterfall view where each row represents an FFT slice
// and each column a frequency bin. The value should be normalized [0,1].
export default function SpectralWaterfall({ data, height = 120 }: SpectralWaterfallProps) {
  const rows = data.slice(-Math.max(1, Math.floor(height)));
  const rowHeight = rows.length ? height / rows.length : 0;
  return (
    <View style={{ width: '100%', height, overflow: 'hidden' }}>
      {rows.map((row, i) => (
        <View key={i} style={{ flexDirection: 'row', height: rowHeight }}>
          {row.map((v, j) => (
            <View
              key={j}
              style={{ flex: 1, backgroundColor: `rgba(0,217,255,${Math.min(1, Math.max(0, v))})` }}
            />
          ))}
        </View>
      ))}
    </View>
  );
}
