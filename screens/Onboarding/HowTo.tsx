import React from 'react';
import { Text, StyleSheet } from 'react-native';
import EVoidButton from '../../components/ui/EVoidButton';
import Screen from '../_layout/Screen';

export default function OnboardingHowTo({ navigation }: any) {
  return (
    <Screen style={styles.flex}>
      <Text style={styles.title}>How to Use Ech0Void</Text>
      <Text style={styles.body}>
        1. Begin a Live ITC session to record and mark anomalies.\n
        2. Review your sessions in the Logbook.\n
        3. Export, share, or analyze your results.\n
        4. Explore advanced features in Settings.
      </Text>
      <EVoidButton label="Privacy & Permissions" onPress={() => navigation?.navigate?.('OnboardingPrivacy')} style={styles.btn} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, backgroundColor: '#111' },
  title: { fontSize: 28, fontWeight: '800', color: '#fff', marginBottom: 24 },
  body: { color: '#ccc', fontSize: 16, textAlign: 'center', marginBottom: 32 },
  btn: { minWidth: 160 },
});
