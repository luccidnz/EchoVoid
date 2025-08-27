import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import EVoidButton from '../../components/ui/EVoidButton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../theme';
import { TYPE } from '../../src/theme/typography';

export default function OnboardingPrivacy({ navigation }: any) {
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
      <Text style={[styles.title, { color: theme.colors.text }]}>Privacy & Permissions</Text>
      <Text style={[styles.body, { color: theme.colors.text, opacity: 0.8 }]}>
        Ech0Void only requests permissions needed for audio recording and file access.{"\n"}
        Your data is stored locally and never shared without your consent.{"\n"}
        You can export or delete your sessions at any time from the Logbook.
      </Text>
      <EVoidButton
        label="Get Started"
        onPress={async () => {
          await AsyncStorage.setItem('onboarded', '1');
          navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
        }}
        style={styles.btn}
      />
      <EVoidButton
        label="Skip Onboarding"
        onPress={async () => {
          await AsyncStorage.setItem('onboarded', '1');
          navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
        }}
        style={[styles.btn, { marginTop: 16, backgroundColor: theme.colors.surface }]}
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
