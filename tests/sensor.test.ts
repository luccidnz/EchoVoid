import { Magnetometer, Accelerometer } from 'expo-sensors';

describe('Sensor Integration', () => {
  it('should have Magnetometer and Accelerometer listeners', () => {
    expect(typeof Magnetometer.addListener).toBe('function');
    expect(typeof Accelerometer.addListener).toBe('function');
  });
});
