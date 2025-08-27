import React from 'react';
import { SafeAreaView, ViewStyle } from 'react-native';
import NoiseOverlay from '../../../components/fx/NoiseOverlay';
import ParticleField from '../../../components/fx/ParticleField';

export default function Screen({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return (
    <SafeAreaView style={[{ flex: 1 }, style]}>
      {children}
      <NoiseOverlay />
      <ParticleField />
    </SafeAreaView>
  );
}

