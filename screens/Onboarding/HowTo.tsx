import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import EVoidButton from '../../components/ui/EVoidButton';
import { SPACING } from '../../src/theme/spacing';
import { FONT_SIZES, FONT_WEIGHTS } from '../../src/theme/typography';

export default function OnboardingHowTo({ navigation }: any) {
  return (
    <View style={styles.flex}>
      <Text style={styles.title}>How to Use Ech0Void</Text>
      <Text style={styles.body}>
        1. Begin a Live ITC session to record and mark anomalies.\n
        2. Review your sessions in the Logbook.\n
        3. Export, share, or analyze your results.\n
        4. Explore advanced features in Settings.
      </Text>
      <EVoidButton label="Privacy & Permissions" onPress={() => navigation?.navigate?.('OnboardingPrivacy')} style={styles.btn} />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl, backgroundColor: '#111' },
  title: { fontSize: FONT_SIZES.xxxl, fontWeight: FONT_WEIGHTS.extrabold, color: '#fff', marginBottom: SPACING.lg },
  body: { color: '#ccc', fontSize: FONT_SIZES.md, textAlign: 'center', marginBottom: SPACING.xl },
  btn: { minWidth: 160 },
});
