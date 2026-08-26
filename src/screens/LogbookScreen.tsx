import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { listSessions } from '../ech0void/sessionStore';
import { MODE_INFO, type Ech0Session } from '../ech0void/types';
import { voidTheme } from '../ech0void/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Logbook'>;
const fmtDuration = (ms: number) => `${Math.floor(ms / 60000)}:${Math.floor((ms % 60000) / 1000).toString().padStart(2, '0')}`;

export default function LogbookScreen({ navigation }: Props) {
  const [sessions, setSessions] = useState<Ech0Session[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setLoading(true);
    listSessions().then(setSessions).finally(() => setLoading(false));
  }, []);

  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));
  useEffect(() => { refresh(); }, [refresh]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable onPress={() => navigation.goBack()}><Text style={styles.back}>← HOME</Text></Pressable>
        <Text style={styles.kicker}>LOCAL SESSION STORAGE</Text>
        <Text style={styles.title}>Session Vault</Text>
        <Text style={styles.sub}>Each entry keeps the room recording (when enabled), marked moments, sensor summary and every app-generated source event.</Text>

        {loading && <Text style={styles.empty}>Reading local vault…</Text>}
        {!loading && sessions.length === 0 && (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>Nothing in the void yet.</Text>
            <Text style={styles.empty}>Run a channel and save a session. It stays on this device unless you explicitly share it.</Text>
          </View>
        )}

        {sessions.map((session) => (
          <Pressable key={session.id} onPress={() => navigation.navigate('SessionDetail', { sessionId: session.id })} style={styles.card}>
            <View style={styles.cardTop}>
              <Text style={styles.mode}>{MODE_INFO[session.mode].title}</Text>
              <Text style={styles.duration}>{fmtDuration(session.durationMs)}</Text>
            </View>
            <Text style={styles.date}>{new Date(session.startedAt).toLocaleString()}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.meta}>{session.sourceEvents.length} generated</Text>
              <Text style={styles.meta}>{session.markers.length} marks</Text>
              <Text style={[styles.meta, session.roomRecordingEnabled ? styles.micOn : undefined]}>{session.roomRecordingEnabled ? 'room audio' : 'no room audio'}</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: voidTheme.bg },
  content: { padding: 20, paddingTop: 28, paddingBottom: 50 },
  back: { color: voidTheme.muted, fontSize: 11, fontWeight: '800', letterSpacing: 1.2 },
  kicker: { color: voidTheme.amber, fontSize: 10, fontWeight: '900', letterSpacing: 2.2, marginTop: 26 },
  title: { color: voidTheme.text, fontSize: 34, fontWeight: '900', marginTop: 4 },
  sub: { color: voidTheme.muted, fontSize: 12, lineHeight: 18, marginTop: 6, marginBottom: 18 },
  emptyBox: { borderWidth: 1, borderColor: voidTheme.border, borderStyle: 'dashed', borderRadius: 18, padding: 20 },
  emptyTitle: { color: voidTheme.text, fontWeight: '800', marginBottom: 6 },
  empty: { color: voidTheme.muted, fontSize: 12, lineHeight: 18 },
  card: { backgroundColor: voidTheme.panel, borderColor: voidTheme.border, borderWidth: 1, borderRadius: 17, padding: 17, marginBottom: 11 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  mode: { color: voidTheme.text, fontSize: 19, fontWeight: '900' },
  duration: { color: voidTheme.cyan, fontSize: 13, fontWeight: '900', fontVariant: ['tabular-nums'] },
  date: { color: voidTheme.muted, fontSize: 11, marginTop: 4 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 12 },
  meta: { color: voidTheme.violet, backgroundColor: '#151124', borderRadius: 20, paddingVertical: 5, paddingHorizontal: 9, fontSize: 9, fontWeight: '800' },
  micOn: { color: voidTheme.green, backgroundColor: '#0D1D18' },
});
