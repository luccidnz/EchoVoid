import React from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { MODE_INFO, type Ech0Mode } from '../ech0void/types';
import { voidTheme } from '../ech0void/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;
const modes: Ech0Mode[] = ['echoBox', 'fieldDrift', 'signalScan'];

export default function HomeScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.kicker}>ECH0VOID // V2 CORE</Text>
            <Text style={styles.title}>Choose a channel</Text>
          </View>
          <Pressable onPress={() => navigation.navigate('Settings')} style={styles.smallButton}>
            <Text style={styles.smallButtonText}>INFO</Text>
          </Pressable>
        </View>

        {modes.map((mode, index) => {
          const info = MODE_INFO[mode];
          return (
            <Pressable key={mode} onPress={() => navigation.navigate('Transmission', { mode })} style={styles.modeCard}>
              <View style={styles.modeTop}>
                <Text style={styles.channel}>0{index + 1}</Text>
                <Text style={styles.modeTitle}>{info.title}</Text>
              </View>
              <Text style={styles.subtitle}>{info.subtitle}</Text>
              <Text style={styles.detail}>{info.detail}</Text>
              <Text style={styles.open}>OPEN CHANNEL →</Text>
            </Pressable>
          );
        })}

        <Pressable onPress={() => navigation.navigate('Logbook')} style={styles.logbook}>
          <View>
            <Text style={styles.logTitle}>SESSION VAULT</Text>
            <Text style={styles.logSub}>Room recordings, markers and full generated-source provenance.</Text>
          </View>
          <Text style={styles.arrow}>↗</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: voidTheme.bg },
  content: { padding: 20, paddingTop: 34, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 },
  kicker: { color: voidTheme.cyan, fontSize: 10, letterSpacing: 2.3, fontWeight: '800' },
  title: { color: voidTheme.text, fontSize: 31, fontWeight: '900', marginTop: 5 },
  smallButton: { borderColor: voidTheme.border, borderWidth: 1, paddingVertical: 9, paddingHorizontal: 12, borderRadius: 12 },
  smallButtonText: { color: voidTheme.muted, fontSize: 11, fontWeight: '800' },
  modeCard: { backgroundColor: voidTheme.panel, borderWidth: 1, borderColor: voidTheme.border, borderRadius: 20, padding: 20, marginBottom: 14 },
  modeTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  channel: { color: voidTheme.violet, fontSize: 12, fontWeight: '900', letterSpacing: 1.6 },
  modeTitle: { color: voidTheme.text, fontSize: 24, fontWeight: '900' },
  subtitle: { color: voidTheme.cyan, marginTop: 10, fontSize: 13, fontWeight: '700' },
  detail: { color: voidTheme.muted, marginTop: 8, fontSize: 13, lineHeight: 19 },
  open: { color: voidTheme.text, marginTop: 17, fontSize: 11, letterSpacing: 1.4, fontWeight: '900' },
  logbook: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#0A0E15', borderRadius: 18, padding: 18, borderWidth: 1, borderColor: '#1A2433', marginTop: 5 },
  logTitle: { color: voidTheme.amber, fontWeight: '900', fontSize: 13, letterSpacing: 1.2 },
  logSub: { color: voidTheme.muted, marginTop: 4, fontSize: 12, maxWidth: 280 },
  arrow: { color: voidTheme.amber, fontSize: 23 },
});
