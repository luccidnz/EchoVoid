import React from 'react';
import { Svg, Rect } from 'react-native-svg';

interface SpectrogramPreviewProps {
  audioBuffer?: ArrayLike<number> | null;
}

export default function SpectrogramPreview({ audioBuffer }: SpectrogramPreviewProps) {
  const width = 300;
  const height = 80;

  if (!audioBuffer || audioBuffer.length === 0) {
    return (
      <Svg height={height} width={width} style={{ backgroundColor: '#222' }}>
        <Rect x={0} y={0} width={width} height={height} fill="#333" />
      </Svg>
    );
  }

  const data = Array.from(audioBuffer);
  const barWidth = width / data.length;

  return (
    <Svg height={height} width={width} style={{ backgroundColor: '#222' }}>
      {data.map((value, index) => (
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
