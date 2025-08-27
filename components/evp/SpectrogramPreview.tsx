import React from 'react';
import { View } from 'react-native';
import { Svg, Rect } from 'react-native-svg';

interface SpectrogramPreviewProps {
  audioBuffer: number[];
}

export default function SpectrogramPreview({ audioBuffer }: SpectrogramPreviewProps) {
  const width = 300;
  const height = 80;
  const barWidth = width / audioBuffer.length;

  return (
    <Svg height={height} width={width} style={{ backgroundColor: '#222' }}>
      {audioBuffer.map((value, index) => (
        <Rect
          key={index}
          x={index * barWidth}
          y={height - value * height}
          width={barWidth - 1}
          height={value * height}
          fill="cyan"
        />
      ))}
    </Svg>
  );
}
