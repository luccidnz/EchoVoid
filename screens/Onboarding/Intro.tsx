import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import EVoidButton from '../../components/ui/EVoidButton';
import { useTheme, Theme } from '../../theme';

export default function OnboardingIntro({ navigation }: any) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  return (
    <View style={styles.flex}>
      <Text style={styles.title}>Welcome to Ech0Void</Text>
      <Text style={styles.body}>
        Ech0Void is a modern ITC toolkit for exploring anomalous audio, spirit communication, and creative consciousness.
        Record, analyze, and share your sessions with a beautiful, intuitive interface.
      </Text>
      <EVoidButton label="How to Use" onPress={() => navigation?.navigate?.('OnboardingHowTo')} style={styles.btn} />
    </View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    flex: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, backgroundColor: '#111' },
    title: { ...theme.typography.heading1, color: '#fff', marginBottom: 24 },
    body: { ...theme.typography.body, color: '#ccc', textAlign: 'center', marginBottom: 32 },
    btn: { minWidth: 160 },
  });
}
