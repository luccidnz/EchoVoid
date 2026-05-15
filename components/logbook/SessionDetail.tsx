import React, { useState, useRef } from 'react';
import { Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Audio } from 'expo-av';
import EVoidButton from '../ui/EVoidButton';
import { shareSessionZip } from '../../services/export/zipSession';
import { playSessionAudio } from '../../services/audio/playSessionAudio';

export default function SessionDetail({ route }: any) {
  const session = route?.params?.session;
  const [playing, setPlaying] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  const handlePlay = async () => {
    await playSessionAudio(session, playing, setPlaying, soundRef, Audio, (title: string, message?: string) =>
      Alert.alert(title, message)
    );
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
        style={{ marginVertical: 16, minWidth: 140 }}
      />
      <Text style={styles.label}>Anomaly Timestamps:</Text>
      {session?.anomalies?.length ? (
        session.anomalies.map((ms: number, i: number) => (
          <Text key={i} style={styles.value}>{ms} ms</Text>
        ))
      ) : (
        <Text style={styles.value}>None</Text>
      )}
      <EVoidButton label="Export Session" onPress={() => shareSessionZip(session)} style={{ marginTop: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  detail: { flex: 1, padding: 20, backgroundColor: '#111' },
  title: { fontSize: 24, fontWeight: '800', color: '#fff', marginBottom: 16 },
  label: { color: '#aaa', fontWeight: '600', marginTop: 12 },
  value: { color: '#fff', fontSize: 15, marginTop: 2 },
});
