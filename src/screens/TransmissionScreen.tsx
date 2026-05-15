import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import { colors } from '../theme/colors';

// Added type annotation for navigation prop
const TransmissionScreen = ({ navigation }: { navigation: any }) => {
  // Log navigation prop
  console.log('[TransmissionScreen] navigation prop:', navigation);

  const AnimatedGradient = Animated.createAnimatedComponent(LinearGradient);

  return (
    <AnimatedGradient
      colors={[colors.bg, '#0A0A1C', colors.card]}
      style={{ flex: 1 }}
      entering={FadeInRight.duration(300)}
      exiting={FadeOutLeft.duration(300)}
    >
      <View style={styles.container}>
        <Text style={styles.h1}>Transmission</Text>
        <Text style={styles.p}>Listening / responses will appear here.</Text>
      </View>
    </AnimatedGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  h1: { color: colors.text, fontSize: 28, fontWeight: '700' },
  p: { color: colors.subtext, marginTop: 8 },
});

export default TransmissionScreen;
