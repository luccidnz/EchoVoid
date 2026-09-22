import React, { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import * as Sharing from 'expo-sharing';
import { createAudioPlayer } from 'expo-audio';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { deleteSession, getSession, updateSession, writeShareableSession } from '../ech0void/sessionStore';
import { MODE_INFO, type Ech0Session } from '../ech0void/types';
import { voidTheme } from '../ech0void/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'SessionDetail'>;
const time = (ms: number) => {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
};

export default function SessionDetailScreen({ route, navigation }: Props) {
  const [session, setSession] = useState<Ech0Session | null>(null);
  const [notes, setNotes] = useState('');
  const [playing, setPlaying] = useState(false);
  const playerRef = useRef<ReturnType<typeof createAudioPlayer> | null>(null);

  useEffect(() => {
    getSession(route.params.sessionId).then((found) => {
      setSession(found);
      setNotes(found?.notes ?? '');
    });
  }, [route.params.sessionId]);

  useEffect(() => () => {
    const player = playerRef.current as unknown as { pause?: () => void; release?: () => void; remove?: () => void } | null;
    try { player?.pause?.(); } catch {}
    try { player?.release?.(); } catch {}
    try { player?.remove?.(); } catch {}
  }, []);

  const togglePlayback = async () => {
    if (!session?.roomRecordingUri) return;
    if (!playerRef.current) playerRef.current = createAudioPlayer(session.roomRecordingUri);
    if (playing) {
      playerRef.current.pause();
      setPlaying(false);
    } else {
      await playerRef.current.seekTo(0);
      playerRef.current.play();
      setPlaying(true);
    }
  };

  const saveNotes = async () => {
    if (!session) return;
    const next = { ...session, notes };
    await updateSession(next);
    setSession(next);
    Alert.alert('Saved', 'Session notes updated locally.');
  };

  const share = async () => {
    if (!session) return;
    const uri = await writeShareableSession({ ...session, notes });
    const supported = await Sharing.isAvailableAsync();
    if (!supported) return Alert.alert('Sharing unavailable', `Export written to ${uri}`);
    await Sharing.shareAsync(uri, { mimeType: 'application/json', dialogTitle: 'Share Ech0Void session export' });
  };

  const remove = () => {
    if (!session) return;
    Alert.alert('Delete session?', 'This removes the local session record and its stored room recording.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteSession(session.id); navigation.replace('Logbook'); } },
    ]);
  };

  if (!session) {
    return <SafeAreaView style={styles.safe}><View style={styles.loading}><Text style={styles.muted}>Loading session…</Text></View></SafeAreaView>;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable onPress={() => navigation.navigate('Logbook')}><Text style={styles.back}>← SESSION VAULT</Text></Pressable>
        <Text style={styles.kicker}>SESSION // {session.id.slice(-7).toUpperCase()}</Text>
        <Text style={styles.title}>{MODE_INFO[session.mode].title}</Text>
        <Text style={styles.date}>{new Date(session.startedAt).toLocaleString()} • {time(session.durationMs)}</Text>

        <View style={styles.summary}>
          <View style={styles.metric}><Text style={styles.metricValue}>{session.sourceEvents.length}</Text><Text style={styles.metricLabel}>GENERATED</Text></View>
          <View style={styles.metric}><Text style={styles.metricValue}>{session.markers.length}</Text><Text style={styles.metricLabel}>MARKS</Text></View>
          <View style={styles.metric}><Text style={styles.metricValue}>{Math.round(session.sensorSummary.maxActivity * 100)}</Text><Text style={styles.metricLabel}>PEAK SENSOR</Text></View>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>ROOM RECORDING</Text>
          {session.roomRecordingUri ? (
            <>
              <Text style={styles.panelText}>This is microphone audio captured during the session. Speaker playback may be audible in it; use the source ledger below to cross-check generated events.</Text>
              <Pressable onPress={togglePlayback} style={styles.playButton}><Text style={styles.playText}>{playing ? 'STOP PLAYBACK' : 'PLAY FROM START'}</Text></Pressable>
            </>
          ) : <Text style={styles.panelText}>No persistent room recording was saved for this session.</Text>}
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>MARKED MOMENTS</Text>
          {session.markers.length === 0 ? <Text style={styles.panelText}>No manual marks.</Text> : session.markers.map((marker) => (
            <View key={marker.id} style={styles.row}><Text style={styles.rowTime}>{time(marker.atMs)}</Text><Text style={styles.rowText}>{marker.label}</Text></View>
          ))}
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>NOTES</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            multiline
            placeholder="What did you hear, notice or want to review?"
            placeholderTextColor="#586477"
            style={styles.input}
          />
          <Pressable onPress={saveNotes} style={styles.secondary}><Text style={styles.secondaryText}>SAVE NOTES</Text></Pressable>
        </View>

        <Text style={styles.ledgerTitle}>FULL SOURCE PROVENANCE</Text>
        <Text style={styles.ledgerExplain}>Every row below is audio generated by Ech0Void, not an unexplained external source.</Text>
        {session.sourceEvents.map((event) => (
          <View key={event.id} style={styles.eventRow}>
            <Text style={styles.rowTime}>{time(event.atMs)}</Text>
            <View style={{ flex: 1 }}><Text style={styles.rowText}>{event.label}</Text><Text style={styles.eventMeta}>{event.effect} • {event.rate.toFixed(2)}× • sensor {Math.round(event.sensorInfluence * 100)}%</Text></View>
            <Text style={styles.gen}>GEN</Text>
          </View>
        ))}

        <Pressable onPress={share} style={styles.share}><Text style={styles.shareText}>SHARE JSON EVIDENCE LOG</Text></Pressable>
        <Pressable onPress={remove} style={styles.delete}><Text style={styles.deleteText}>DELETE LOCAL SESSION</Text></Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: voidTheme.bg },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 20, paddingTop: 28, paddingBottom: 55 },
  back: { color: voidTheme.muted, fontSize: 11, fontWeight: '800', letterSpacing: 1.2 },
  kicker: { color: voidTheme.violet, fontSize: 10, fontWeight: '900', letterSpacing: 2, marginTop: 24 },
  title: { color: voidTheme.text, fontSize: 35, fontWeight: '900', marginTop: 3 },
  date: { color: voidTheme.muted, marginTop: 4, fontSize: 11 },
  summary: { flexDirection: 'row', gap: 8, marginTop: 18, marginBottom: 13 },
  metric: { flex: 1, backgroundColor: voidTheme.panel, borderRadius: 14, borderWidth: 1, borderColor: voidTheme.border, padding: 12, alignItems: 'center' },
  metricValue: { color: voidTheme.cyan, fontSize: 20, fontWeight: '900' },
  metricLabel: { color: voidTheme.muted, fontSize: 8, fontWeight: '900', marginTop: 3 },
  panel: { backgroundColor: voidTheme.panel, borderRadius: 17, borderColor: voidTheme.border, borderWidth: 1, padding: 16, marginBottom: 11 },
  panelTitle: { color: voidTheme.text, fontSize: 11, fontWeight: '900', letterSpacing: 1.4, marginBottom: 9 },
  panelText: { color: voidTheme.muted, fontSize: 11, lineHeight: 17 },
  playButton: { backgroundColor: voidTheme.cyan, borderRadius: 12, alignItems: 'center', paddingVertical: 12, marginTop: 12 },
  playText: { color: '#031014', fontWeight: '900', fontSize: 11 },
  row: { flexDirection: 'row', gap: 11, paddingVertical: 7, borderBottomColor: voidTheme.border, borderBottomWidth: StyleSheet.hairlineWidth },
  rowTime: { color: voidTheme.cyan, fontSize: 10, width: 40, fontVariant: ['tabular-nums'] },
  rowText: { color: voidTheme.text, fontSize: 11, fontWeight: '700' },
  input: { minHeight: 95, color: voidTheme.text, backgroundColor: '#070A0F', borderRadius: 12, borderWidth: 1, borderColor: '#1A2432', padding: 12, textAlignVertical: 'top', fontSize: 12 },
  secondary: { borderColor: voidTheme.violet, borderWidth: 1, borderRadius: 12, paddingVertical: 11, alignItems: 'center', marginTop: 9 },
  secondaryText: { color: voidTheme.violet, fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  ledgerTitle: { color: voidTheme.text, fontSize: 13, fontWeight: '900', letterSpacing: 1.5, marginTop: 17 },
  ledgerExplain: { color: voidTheme.muted, fontSize: 10, lineHeight: 15, marginTop: 5, marginBottom: 8 },
  eventRow: { flexDirection: 'row', gap: 10, alignItems: 'center', paddingVertical: 9, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: voidTheme.border },
  eventMeta: { color: voidTheme.muted, fontSize: 9, marginTop: 2 },
  gen: { color: voidTheme.violet, fontSize: 9, fontWeight: '900' },
  share: { backgroundColor: voidTheme.amber, borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 22 },
  shareText: { color: '#161005', fontWeight: '900', fontSize: 11, letterSpacing: 1 },
  delete: { borderWidth: 1, borderColor: '#54232B', borderRadius: 14, paddingVertical: 13, alignItems: 'center', marginTop: 9 },
  deleteText: { color: voidTheme.danger, fontWeight: '900', fontSize: 10, letterSpacing: 1 },
  muted: { color: voidTheme.muted },
});
