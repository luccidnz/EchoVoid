import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import * as Recorder from '../services/audio/Recorder';
import SessionStore from '../services/sessions/SessionStore';
import SpectrogramPreview from '../components/evp/SpectrogramPreview';
import { detectAnomalies } from '../src/core/anomaly/detector';

export default function EVPRecorder() {
  const [recording, setRecording] = useState(false);
  const [uri, setUri] = useState<string | null>(null);
  const [markers, setMarkers] = useState<number[]>([]);
  const [anomalies, setAnomalies] = useState<any[]>([]);

  const start = async () => {
    await Recorder.startRecording();
    setRecording(true);
    setUri(null);
    setMarkers([]);
    setAnomalies([]);
  };

  const stop = async () => {
    const result = await Recorder.stopRecording();
    setRecording(false);
    setUri(result);
    setMarkers(Recorder.getMarkers());
    // Simulate anomaly detection (replace with real buffer later)
    const fakeBuffer = new Float32Array(2048).map(() => Math.random() * 2 - 1);
    setAnomalies(detectAnomalies(fakeBuffer));
  };

  const mark = () => {
    Recorder.markAnomaly();
    setMarkers([...Recorder.getMarkers()]);
  };

  const saveSession = async () => {
    if (!uri) return;
    const session = {
      id: Date.now().toString(),
      type: 'evp',
      uri,
      markers,
      anomalies,
      created: new Date().toISOString(),
    };
    await SessionStore.create(session);
    Alert.alert('Session Saved', 'Your EVP session has been saved to the logbook.');
  };

  const handlePlay = () => {
    if (uri) {
      Alert.alert('Playing Recording', `Playing file: ${uri}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>EVP Recorder</Text>
      <View style={styles.status}>
        <Text>Status: {recording ? 'Recording...' : uri ? 'Stopped' : 'Idle'}</Text>
        {uri && <Text>File: {uri}</Text>}
        {markers.length > 0 && <Text>Markers: {markers.join(', ')}</Text>}
        {anomalies.length > 0 && (
          <View style={{ marginTop: 8 }}>
            <Text>Anomalies Detected:</Text>
            {anomalies.map((a, i) => (
              <Text key={i}>{`Time: ${a.time}, Freq: ${Math.round(a.freq)}Hz, Confidence: ${Math.round(a.confidence * 100)}%`}</Text>
            ))}
          </View>
        )}
      </View>
      <SpectrogramPreview />
      <View style={styles.buttons}>
        {!recording ? (
          <Button title="Start Recording" onPress={start} />
        ) : (
          <Button title="Stop Recording" onPress={stop} />
        )}
        {recording && <Button title="Mark Anomaly" onPress={mark} />}
        {uri && <Button title="Save Session" onPress={saveSession} />}
        {uri && <Button title="Play Recording" onPress={handlePlay} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 16 },
  status: { marginBottom: 24 },
  buttons: { gap: 12 },
});
