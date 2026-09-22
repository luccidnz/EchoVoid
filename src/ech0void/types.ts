export type Ech0Mode = 'echoBox' | 'fieldDrift' | 'signalScan';

export type ClipFamily = 'vocal' | 'reversed' | 'noise' | 'scan' | 'breath';

export interface EngineSettings {
  intensity: number;
  variation: number;
  texture: number;
  sensorMix: number;
  output: number;
}

export interface ProceduralClip {
  id: string;
  uri: string;
  family: ClipFamily;
  durationMs: number;
  label: string;
}

export interface SourceEvent {
  id: string;
  atMs: number;
  sourceId: string;
  family: ClipFamily;
  label: string;
  effect: string;
  rate: number;
  volume: number;
  sensorInfluence: number;
  provenance: 'ech0void-generated';
}

export interface SessionMarker {
  id: string;
  atMs: number;
  label: string;
}

export interface Ech0Session {
  id: string;
  mode: Ech0Mode;
  startedAt: string;
  endedAt: string;
  durationMs: number;
  settings: EngineSettings;
  roomRecordingUri: string | null;
  roomRecordingEnabled: boolean;
  sourceEvents: SourceEvent[];
  markers: SessionMarker[];
  notes: string;
  sensorSummary: {
    maxActivity: number;
    averageActivity: number;
    lastMagneticFieldUt: number | null;
  };
  schemaVersion: 2;
}

export const MODE_INFO: Record<Ech0Mode, { title: string; subtitle: string; detail: string }> = {
  echoBox: {
    title: 'EchoBox',
    subtitle: 'Layered fragments • decays • overlapping echoes',
    detail: 'Short locally-generated vocal-like fragments are layered and echoed. Every generated source is timestamped in the session ledger.',
  },
  fieldDrift: {
    title: 'Field Drift',
    subtitle: 'Jump cuts • reverse fragments • rate drift • dropouts',
    detail: 'Fragment selection, playback rate and silence windows drift with seeded variation and optional device-sensor influence.',
  },
  signalScan: {
    title: 'Signal Scan',
    subtitle: 'Static beds • gated scans • chirps • sparse fragments',
    detail: 'Procedural radio-like noise and scanning tones form a moving bed with gated non-semantic fragments.',
  },
};

export const DEFAULT_SETTINGS: EngineSettings = {
  intensity: 0.56,
  variation: 0.62,
  texture: 0.52,
  sensorMix: 0.35,
  output: 0.72,
};

export const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
