import React from 'react';
import { SafeAreaView, ViewStyle } from 'react-native';
import NoiseOverlay from '../../components/fx/NoiseOverlay';
import ParticleField from '../../components/fx/ParticleField';
// TODO: Add ParticleField and other global FX as needed
export default function Screen({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return (
    <SafeAreaView style={[{ flex: 1 }, style]}>
      {children}
      <NoiseOverlay />
      <ParticleField />
    </SafeAreaView>
  );
}
