import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import EVoidButton from '../../components/ui/EVoidButton';
import { SPACING } from '../../src/theme/spacing';
import { FONT_SIZES, FONT_WEIGHTS } from '../../src/theme/typography';

export default function OnboardingIntro({ navigation }: any) {
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

const styles = StyleSheet.create({
  flex: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl, backgroundColor: '#111' },
  title: { fontSize: FONT_SIZES.xxxl, fontWeight: FONT_WEIGHTS.extrabold, color: '#fff', marginBottom: SPACING.lg },
  body: { color: '#ccc', fontSize: FONT_SIZES.md, textAlign: 'center', marginBottom: SPACING.xl },
  btn: { minWidth: 160 },
});
