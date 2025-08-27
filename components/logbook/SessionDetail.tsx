import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Audio } from 'expo-av';
import EVoidButton from '../ui/EVoidButton';
import { shareSessionZip } from '../../services/export/zipSession';
import { SPACING } from '../../src/theme/spacing';
import { FONT_SIZES, FONT_WEIGHTS } from '../../src/theme/typography';

export default function SessionDetail({ route }: any) {
  const session = route?.params?.session;
  const [playing, setPlaying] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  const handlePlay = async () => {
    if (!session?.uri) return;
    if (playing) {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      setPlaying(false);
      return;
    }
    try {
      const { sound } = await Audio.Sound.createAsync({ uri: session.uri }, { shouldPlay: true });
      soundRef.current = sound;
      setPlaying(true);
      sound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded || status.didJustFinish) {
          setPlaying(false);
          sound.unloadAsync();
          soundRef.current = null;
        }
      });
    } catch {}
  };

  return (
    <ScrollView style={styles.detail} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.title}>Session Detail</Text>
      <Text style={styles.label}>Type:</Text>
      <Text style={styles.value}>{session?.type || 'Session'}</Text>
      <Text style={styles.label}>Date:</Text>
      <Text style={styles.value}>{new Date(session?.created).toLocaleString()}</Text>
      <Text style={styles.label}>Anomalies:</Text>
      <Text style={styles.value}>{session?.anomalies?.length ?? 0}</Text>
      <EVoidButton
        label={playing ? 'Stop Playback' : 'Play Recording'}
        onPress={handlePlay}
        style={{ marginVertical: SPACING.md, minWidth: 140 }}
      />
      <Text style={styles.label}>Anomaly Timestamps:</Text>
      {session?.anomalies?.length ? (
        session.anomalies.map((ms: number, i: number) => (
          <Text key={i} style={styles.value}>{ms} ms</Text>
        ))
      ) : (
        <Text style={styles.value}>None</Text>
      )}
  <EVoidButton label="Export Session" onPress={() => shareSessionZip(session)} style={{ marginTop: SPACING.lg }} />
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  detail: { flex: 1, padding: SPACING.md + SPACING.xs, backgroundColor: '#111' },
  title: { fontSize: FONT_SIZES.xxl, fontWeight: FONT_WEIGHTS.extrabold, color: '#fff', marginBottom: SPACING.md },
  label: { color: '#aaa', fontWeight: FONT_WEIGHTS.semibold, marginTop: SPACING.sm + SPACING.xs },
  value: { color: '#fff', fontSize: 15, marginTop: SPACING.xxs },
});
