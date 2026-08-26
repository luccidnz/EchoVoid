import { useEffect, useRef, useState } from 'react';
import { Accelerometer, Magnetometer } from 'expo-sensors';
import { clamp01 } from './types';
import { mixSeed } from './random';

export interface SensorEntropyState {
  activity: number;
  seed: number;
  magneticFieldUt: number | null;
  available: boolean;
}

const magnitude = (v: [number, number, number]) => Math.sqrt(v[0] ** 2 + v[1] ** 2 + v[2] ** 2);
const delta3 = (a: [number, number, number], b: [number, number, number]) =>
  Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]);

export function useSensorEntropy(): SensorEntropyState {
  const [state, setState] = useState<SensorEntropyState>({ activity: 0, seed: 1, magneticFieldUt: null, available: false });
  const magRef = useRef<[number, number, number]>([0, 0, 0]);
  const accRef = useRef<[number, number, number]>([0, 0, 0]);
  const prevMagRef = useRef<[number, number, number]>([0, 0, 0]);
  const prevAccRef = useRef<[number, number, number]>([0, 0, 0]);
  const smoothRef = useRef(0);

  useEffect(() => {
    let mounted = true;
    let magSub: { remove: () => void } | null = null;
    let accSub: { remove: () => void } | null = null;

    Magnetometer.setUpdateInterval(120);
    Accelerometer.setUpdateInterval(120);

    const publish = () => {
      const magDelta = delta3(magRef.current, prevMagRef.current);
      const accDelta = delta3(accRef.current, prevAccRef.current);
      prevMagRef.current = [...magRef.current] as [number, number, number];
      prevAccRef.current = [...accRef.current] as [number, number, number];
      const raw = clamp01(magDelta / 55 + accDelta / 3.2);
      smoothRef.current = smoothRef.current * 0.78 + raw * 0.22;
      const field = magnitude(magRef.current);
      const seed = mixSeed(
        Math.round(magRef.current[0] * 100),
        Math.round(magRef.current[1] * 100),
        Math.round(magRef.current[2] * 100),
        Math.round(accRef.current[0] * 1000),
        Math.round(accRef.current[1] * 1000),
        Math.round(accRef.current[2] * 1000),
      );
      if (mounted) {
        setState({ activity: smoothRef.current, seed, magneticFieldUt: field || null, available: true });
      }
    };

    Promise.all([Magnetometer.isAvailableAsync(), Accelerometer.isAvailableAsync()])
      .then(([magAvailable, accAvailable]) => {
        if (!mounted || !magAvailable || !accAvailable) return;
        magSub = Magnetometer.addListener(({ x, y, z }) => {
          magRef.current = [x, y, z];
          publish();
        });
        accSub = Accelerometer.addListener(({ x, y, z }) => {
          accRef.current = [x, y, z];
        });
      })
      .catch(() => undefined);

    return () => {
      mounted = false;
      magSub?.remove();
      accSub?.remove();
    };
  }, []);

  return state;
}
