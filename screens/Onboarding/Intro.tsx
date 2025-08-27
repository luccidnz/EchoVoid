import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import EVoidButton from '../../components/ui/EVoidButton';
import { useTheme } from '../../theme';

export default function OnboardingIntro({ navigation }: any) {
  const { theme } = useTheme();
  return (
    <View style={[styles.flex, { backgroundColor: theme.colors.bg }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Welcome to Ech0Void</Text>
      <Text style={[styles.body, { color: theme.colors.text, opacity: 0.8 }]}>
        Ech0Void is a modern ITC toolkit for exploring anomalous audio, spirit communication, and creative consciousness.
        Record, analyze, and share your sessions with a beautiful, intuitive interface.
      </Text>
      <EVoidButton label="How to Use" onPress={() => navigation?.navigate?.('OnboardingHowTo')} style={styles.btn} />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 24 },
  body: { fontSize: 16, textAlign: 'center', marginBottom: 32 },
  btn: { minWidth: 160 },
});
