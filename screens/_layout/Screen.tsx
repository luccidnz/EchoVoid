import React, { useEffect, useRef } from 'react';
import { SafeAreaView, ViewStyle, Animated, ImageBackground, StyleSheet } from 'react-native';
import NoiseOverlay from '../../components/fx/NoiseOverlay';
import ParticleField from '../../components/fx/ParticleField';
import { useTheme, backgroundAssets } from '../../src/theme/theme';

const AnimatedImageBackground = Animated.createAnimatedComponent(ImageBackground);

export default function Screen({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  const { theme } = useTheme();
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fade.setValue(0);
    Animated.timing(fade, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [theme.name]);

  const source = backgroundAssets[theme.name];

  return (
    <SafeAreaView style={[{ flex: 1 }, style]}>
      <AnimatedImageBackground
        source={source}
        resizeMode="cover"
        style={[StyleSheet.absoluteFill, { opacity: fade }]}
      />
      <NoiseOverlay />
      <ParticleField />
      {children}
    </SafeAreaView>
  );
}
