import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import Slider from '@react-native-community/slider';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { Ech0VoidEngine } from '../ech0void/engine';
import { DEFAULT_SETTINGS, MODE_INFO, clamp01, type EngineSettings, type SessionMarker, type SourceEvent } from '../ech0void/types';
import { useSensorEntropy } from '../ech0void/sensors';
import { persistRoomRecording, saveSession } from '../ech0void/sessionStore';
import { voidTheme } from '../ech0void/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Transmission'>;

const formatTime = (ms: number) => {
  const total = Math.floor(ms / 1000);
  const min = Math.floor(total / 60).toString().padStart(2, '0');
  const sec = (total % 60).toString().padStart(2, '0');
  return `${min}:${sec}`;
};

const createId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

function Control({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <View style={styles.control}>
      <View style={styles.controlHeader}>
        <Text style={styles.controlLabel}>{label}</Text>
        <Text style={styles.controlValue}>{Math.round(value * 100)}</Text>
      </View>
      <Slider
        minimumValue={0}
        maximumValue={1}
        value={value}
        onValueChange={onChange}
        minimumTrackTintColor={voidTheme.cyan}
        maximumTrackTintColor={voidTheme.border}
        thumbTintColor={voidTheme.text}
      />
    </View>
  );
}

export default function TransmissionScreen({ route, navigation }: Props) {
  const { mode } = route.params;
  const info = MODE_INFO[mode];
  const [settings, setSettings] = useState<EngineSettings>({ ...DEFAULT_SETTINGS });
  const [running, setRunning] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [status, setStatus] = useState('Channel idle');
  const [events, setEvents] = useState<SourceEvent[]>([]);
  const [markers, setMarkers] = useState<SessionMarker[]>([]);
  const allEventsRef = useRef<SourceEvent[]>([]);
  const startedAtRef = useRef(0);
  const engineRef = useRef(new Ech0VoidEngine(DEFAULT_SETTINGS));
  const sensor = useSensorEntropy();
  const sensorSamplesRef = useRef<number[]>([]);
  const maxSensorRef = useRef(0);

  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder, 300);

  useEffect(() => {
    engineRef.current.updateSettings(settings);
  }, [settings]);

  useEffect(() => {
    engineRef.current.updateSensor(sensor.activity, sensor.seed);
    if (running) {
      sensorSamplesRef.current.push(sensor.activity);
      if (sensorSamplesRef.current.length > 3000) sensorSamplesRef.current.shift();
      maxSensorRef.current = Math.max(maxSensorRef.current, sensor.activity);
    }
  }, [sensor.activity, sensor.seed, running]);

  useEffect(() => {
    engineRef.current.warmUp().catch(() => setStatus('Source-bank warm-up will retry when the session starts'));
    return () => engineRef.current.stop();
  }, []);

  useEffect(() => {
    if (!running) return undefined;
    const timer = setInterval(() => setElapsedMs(Date.now() - startedAtRef.current), 250);
    return () => clearInterval(timer);
  }, [running]);

  const activityBars = useMemo(() => Math.max(1, Math.round(sensor.activity * 12)), [sensor.activity]);

  const setSetting = (key: keyof EngineSettings) => (value: number) => {
    setSettings((current) => ({ ...current, [key]: clamp01(value) }));
  };

  const startSession = async () => {
    if (running) return;
    let roomRecordingEnabled = false;
    try {
      const permission = await AudioModule.requestRecordingPermissionsAsync();
      if (permission.granted) {
        await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true, interruptionMode: 'mixWithOthers' });
        await recorder.prepareToRecordAsync();
        recorder.record();
        roomRecordingEnabled = true;
      }
    } catch {
      roomRecordingEnabled = false;
    }

    allEventsRef.current = [];
    sensorSamplesRef.current = [];
    maxSensorRef.current = 0;
    setEvents([]);
    setMarkers([]);
    setElapsedMs(0);
    startedAtRef.current = Date.now();
    setRunning(true);
    setStatus(roomRecordingEnabled ? 'LIVE • room mic + generated channel' : 'LIVE • generated channel (room mic unavailable)');

    try {
      await engineRef.current.start(mode, (event) => {
        allEventsRef.current.push(event);
        if (allEventsRef.current.length > 1800) allEventsRef.current.shift();
        setEvents((current) => [event, ...current].slice(0, 36));
      });
    } catch (error) {
      setRunning(false);
      setStatus('Could not start the audio engine');
      try { if (roomRecordingEnabled) await recorder.stop(); } catch {}
      Alert.alert('Ech0Void', error instanceof Error ? error.message : 'Unable to start the channel.');
    }
  };

  const markMoment = () => {
    if (!running) return;
    const atMs = Date.now() - startedAtRef.current;
    setMarkers((current) => [...current, { id: createId(), atMs, label: `MARK ${current.length + 1}` }]);
  };

  const stopSession = async () => {
    if (!running) return;
    const endedAtMs = Date.now();
    setRunning(false);
    engineRef.current.stop();
    setStatus('Saving session…');

    let recordedUri: string | null = null;
    const hadRoomRecording = recorderState.isRecording;
    try {
      if (recorderState.isRecording) await recorder.stop();
      recordedUri = recorder.uri ?? null;
    } catch {
      recordedUri = null;
    }

    const sessionId = createId();
    let persistentRecording: string | null = null;
    try {
      persistentRecording = await persistRoomRecording(sessionId, recordedUri);
    } catch {
      persistentRecording = null;
    }

    const samples = sensorSamplesRef.current;
    const averageActivity = samples.length ? samples.reduce((sum, value) => sum + value, 0) / samples.length : 0;
    await saveSession({
      id: sessionId,
      mode,
      startedAt: new Date(startedAtRef.current).toISOString(),
      endedAt: new Date(endedAtMs).toISOString(),
      durationMs: endedAtMs - startedAtRef.current,
      settings: { ...settings },
      roomRecordingUri: persistentRecording,
      roomRecordingEnabled: Boolean(hadRoomRecording && persistentRecording),
      sourceEvents: allEventsRef.current,
      markers,
      notes: '',
      sensorSummary: {
        maxActivity: maxSensorRef.current,
        averageActivity,
        lastMagneticFieldUt: sensor.magneticFieldUt,
      },
      schemaVersion: 2,
    });
    navigation.replace('SessionDetail', { sessionId });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topRow}>
          <Pressable onPress={() => navigation.goBack()} disabled={running}><Text style={[styles.back, running && styles.disabled]}>← HOME</Text></Pressable>
          <Text style={styles.timer}>{formatTime(elapsedMs)}</Text>
        </View>

        <Text style={styles.kicker}>CHANNEL // {mode.toUpperCase()}</Text>
        <Text style={styles.title}>{info.title}</Text>
        <Text style={styles.subtitle}>{info.subtitle}</Text>

        <View style={styles.statusPanel}>
          <View style={styles.statusLine}><View style={[styles.dot, running && styles.dotLive]} /><Text style={styles.status}>{status}</Text></View>
          <Text style={styles.sensorLabel}>DEVICE SENSOR ACTIVITY</Text>
          <Text style={styles.activity}>{'▮'.repeat(activityBars)}{'▯'.repeat(12 - activityBars)}</Text>
          <Text style={styles.sensorMeta}>
            {sensor.available ? `Magnetic field ${sensor.magneticFieldUt?.toFixed(1) ?? '—'} µT • influence ${Math.round(settings.sensorMix * 100)}%` : 'Sensors unavailable • engine remains deterministic/local'}
          </Text>
        </View>

        {!running && (
          <View style={styles.controlsPanel}>
            <Control label="INTENSITY" value={settings.intensity} onChange={setSetting('intensity')} />
            <Control label="VARIATION" value={settings.variation} onChange={setSetting('variation')} />
            <Control label="TEXTURE" value={settings.texture} onChange={setSetting('texture')} />
            <Control label="SENSOR MIX" value={settings.sensorMix} onChange={setSetting('sensorMix')} />
            <Control label="OUTPUT" value={settings.output} onChange={setSetting('output')} />
          </View>
        )}

        <View style={styles.actions}>
          <Pressable onPress={running ? stopSession : startSession} style={[styles.mainButton, running && styles.stopButton]}>
            <Text style={styles.mainButtonText}>{running ? 'END + SAVE SESSION' : 'START SESSION'}</Text>
          </Pressable>
          {running && <Pressable onPress={markMoment} style={styles.markButton}><Text style={styles.markText}>MARK MOMENT</Text></Pressable>}
        </View>

        <View style={styles.ledgerHeader}>
          <Text style={styles.ledgerTitle}>SOURCE LEDGER</Text>
          <Text style={styles.ledgerCount}>{allEventsRef.current.length} generated events</Text>
        </View>
        <Text style={styles.ledgerExplain}>Everything below came from Ech0Void itself. These timestamps are the contamination/provenance reference for reviewing the room recording.</Text>

        {events.length === 0 ? (
          <View style={styles.empty}><Text style={styles.emptyText}>No generated source events yet.</Text></View>
        ) : events.map((event) => (
          <View key={event.id} style={styles.eventRow}>
            <Text style={styles.eventTime}>{formatTime(event.atMs)}</Text>
            <View style={styles.eventBody}>
              <Text style={styles.eventLabel}>{event.label}</Text>
              <Text style={styles.eventMeta}>{event.effect} • {event.rate.toFixed(2)}× • sensor {Math.round(event.sensorInfluence * 100)}%</Text>
            </View>
            <Text style={styles.generated}>GEN</Text>
          </View>
        ))}

        <Text style={styles.footerNote}>Headphones reduce speaker bleed into the room mic. Speaker use is still supported; the ledger exists so generated output can be checked against marked moments later.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: voidTheme.bg },
  content: { padding: 18, paddingTop: 20, paddingBottom: 50 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  back: { color: voidTheme.muted, fontSize: 11, fontWeight: '800', letterSpacing: 1.2 },
  disabled: { opacity: 0.25 },
  timer: { color: voidTheme.cyan, fontVariant: ['tabular-nums'], fontSize: 18, fontWeight: '900' },
  kicker: { color: voidTheme.violet, fontSize: 10, fontWeight: '900', letterSpacing: 2.3, marginTop: 25 },
  title: { color: voidTheme.text, fontSize: 38, fontWeight: '900', marginTop: 3 },
  subtitle: { color: voidTheme.muted, marginTop: 3, marginBottom: 17 },
  statusPanel: { backgroundColor: voidTheme.panel, borderWidth: 1, borderColor: voidTheme.border, borderRadius: 18, padding: 16 },
  statusLine: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: voidTheme.muted },
  dotLive: { backgroundColor: voidTheme.green },
  status: { color: voidTheme.text, fontSize: 12, fontWeight: '700' },
  sensorLabel: { color: voidTheme.muted, fontSize: 9, letterSpacing: 1.5, marginTop: 15 },
  activity: { color: voidTheme.cyan, letterSpacing: 2, fontSize: 17, marginTop: 5 },
  sensorMeta: { color: voidTheme.muted, fontSize: 11, marginTop: 6 },
  controlsPanel: { backgroundColor: '#080B10', borderRadius: 18, borderWidth: 1, borderColor: '#161F2C', padding: 12, marginTop: 14 },
  control: { marginVertical: 4 },
  controlHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 },
  controlLabel: { color: voidTheme.muted, fontSize: 9, fontWeight: '900', letterSpacing: 1.3 },
  controlValue: { color: voidTheme.text, fontSize: 10, fontWeight: '800' },
  actions: { marginTop: 15, gap: 9 },
  mainButton: { backgroundColor: voidTheme.cyan, paddingVertical: 16, borderRadius: 15, alignItems: 'center' },
  stopButton: { backgroundColor: voidTheme.danger },
  mainButtonText: { color: '#031014', fontWeight: '900', letterSpacing: 1.2 },
  markButton: { borderColor: voidTheme.amber, borderWidth: 1, paddingVertical: 13, borderRadius: 14, alignItems: 'center' },
  markText: { color: voidTheme.amber, fontWeight: '900', letterSpacing: 1.2 },
  ledgerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 27 },
  ledgerTitle: { color: voidTheme.text, fontWeight: '900', letterSpacing: 1.5, fontSize: 13 },
  ledgerCount: { color: voidTheme.violet, fontSize: 10, fontWeight: '700' },
  ledgerExplain: { color: voidTheme.muted, fontSize: 11, lineHeight: 16, marginTop: 6, marginBottom: 10 },
  empty: { borderWidth: 1, borderStyle: 'dashed', borderColor: voidTheme.border, borderRadius: 14, padding: 20, alignItems: 'center' },
  emptyText: { color: voidTheme.muted, fontSize: 12 },
  eventRow: { flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: voidTheme.border, paddingVertical: 10 },
  eventTime: { color: voidTheme.cyan, fontSize: 11, fontVariant: ['tabular-nums'], width: 40 },
  eventBody: { flex: 1 },
  eventLabel: { color: voidTheme.text, fontSize: 12, fontWeight: '700' },
  eventMeta: { color: voidTheme.muted, fontSize: 10, marginTop: 2 },
  generated: { color: voidTheme.violet, fontSize: 9, fontWeight: '900' },
  footerNote: { color: voidTheme.muted, fontSize: 10, lineHeight: 15, marginTop: 20 },
});
