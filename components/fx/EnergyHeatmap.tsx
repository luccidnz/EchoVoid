import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';

interface Props {
  magnetometer: number[];
  accelerometer: number[];
  sensitivity: number;
  windowSize?: number;
  onSpike?: (variance: number) => void;
}

export default function EnergyHeatmap({ magnetometer, accelerometer, sensitivity, windowSize = 10, onSpike }: Props) {
  const magHistory = useRef<number[]>([]);
  const accHistory = useRef<number[]>([]);
  const [intensity, setIntensity] = useState(0);

  useEffect(() => {
    const magMag = Math.sqrt(magnetometer.reduce((s, v) => s + v * v, 0));
    const accMag = Math.sqrt(accelerometer.reduce((s, v) => s + v * v, 0));

    magHistory.current.push(magMag);
    if (magHistory.current.length > windowSize) magHistory.current.shift();
    accHistory.current.push(accMag);
    if (accHistory.current.length > windowSize) accHistory.current.shift();

    const magAvg = magHistory.current.reduce((a, b) => a + b, 0) / magHistory.current.length;
    const accAvg = accHistory.current.reduce((a, b) => a + b, 0) / accHistory.current.length;

    const variance = Math.abs(magMag - magAvg) + Math.abs(accMag - accAvg);
    const scaled = Math.min(1, variance / sensitivity);
    setIntensity(scaled);

    if (variance > sensitivity) {
      onSpike?.(variance);
    }
  }, [magnetometer, accelerometer, sensitivity, windowSize, onSpike]);

  return <View pointerEvents="none" style={[styles.overlay, { backgroundColor: `rgba(255,0,0,${intensity})` }]} />;
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject },
});

