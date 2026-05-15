import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import EVoidButton from '../../components/ui/EVoidButton';
import { useTheme } from '../../theme';
import { TYPE } from '../../src/theme/typography';

export default function OnboardingHowTo({ navigation }: any) {
  const { theme } = useTheme();
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={[styles.flex, { backgroundColor: theme.colors.bg }]}>
      <Animated.Image
        source={require('../../assets/logo.svg')}
        style={[styles.logo, { opacity: fade, transform: [{ translateY: slide }] }]}
      />
      <Text style={[styles.title, { color: theme.colors.text }]}>How to Use Ech0Void</Text>
      <Text style={[styles.body, { color: theme.colors.text, opacity: 0.8 }]}>
        1. Begin a Live ITC session to record and mark anomalies.{"\n"}
        2. Review your sessions in the Logbook.{"\n"}
        3. Export, share, or analyze your results.{"\n"}
        4. Explore advanced features in Settings.
      </Text>
      <EVoidButton
        label="Privacy & Permissions"
        onPress={() => navigation?.navigate?.('OnboardingPrivacy')}
        style={styles.btn}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  logo: { width: 96, height: 96, marginBottom: 16 },
  title: { ...TYPE.h1, marginBottom: 24 },
  body: { ...TYPE.body, textAlign: 'center', marginBottom: 32 },
  btn: { minWidth: 160 },
});
