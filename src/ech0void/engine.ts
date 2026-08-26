import { createAudioPlayer } from 'expo-audio';
import { buildProceduralBank } from './proceduralBank';
import { XorShift32, mixSeed } from './random';
import type { Ech0Mode, EngineSettings, ProceduralClip, SourceEvent } from './types';
import { clamp01 } from './types';

type PlayerLike = ReturnType<typeof createAudioPlayer>;
type EventSink = (event: SourceEvent) => void;

function releasePlayer(player: PlayerLike) {
  try { player.pause(); } catch {}
  const candidate = player as unknown as { release?: () => void; remove?: () => void };
  try { candidate.release?.(); } catch {}
  try { candidate.remove?.(); } catch {}
}

export class Ech0VoidEngine {
  private bank: ProceduralClip[] = [];
  private players = new Set<PlayerLike>();
  private timers = new Set<ReturnType<typeof setTimeout>>();
  private running = false;
  private mode: Ech0Mode = 'echoBox';
  private settings: EngineSettings;
  private rng = new XorShift32(Date.now());
  private startedAt = 0;
  private eventSink: EventSink | null = null;
  private sensorActivity = 0;
  private sensorSeed = 1;

  constructor(settings: EngineSettings) {
    this.settings = { ...settings };
  }

  async warmUp() {
    this.bank = await buildProceduralBank();
  }

  updateSettings(settings: EngineSettings) {
    this.settings = { ...settings };
  }

  updateSensor(activity: number, seed: number) {
    this.sensorActivity = clamp01(activity);
    this.sensorSeed = seed >>> 0;
  }

  async start(mode: Ech0Mode, onEvent: EventSink) {
    this.stop();
    if (!this.bank.length) await this.warmUp();
    this.mode = mode;
    this.startedAt = Date.now();
    this.eventSink = onEvent;
    this.rng = new XorShift32(mixSeed(this.startedAt, this.sensorSeed, mode.length * 1009));
    this.running = true;
    this.scheduleNext(30);
  }

  stop() {
    this.running = false;
    for (const timer of this.timers) clearTimeout(timer);
    this.timers.clear();
    for (const player of this.players) releasePlayer(player);
    this.players.clear();
    this.eventSink = null;
  }

  private schedule(callback: () => void, ms: number) {
    const timer = setTimeout(() => {
      this.timers.delete(timer);
      callback();
    }, Math.max(0, ms));
    this.timers.add(timer);
  }

  private scheduleNext(delayOverride?: number) {
    if (!this.running) return;
    const { intensity, variation, sensorMix } = this.settings;
    const sensorPush = this.sensorActivity * sensorMix;
    const base = this.mode === 'signalScan' ? 510 : this.mode === 'fieldDrift' ? 830 : 1050;
    const density = 0.55 + intensity * 1.5 + sensorPush * 0.55;
    const jitter = this.rng.range(0.58, 1.42 + variation * 0.5);
    const delay = delayOverride ?? Math.max(150, (base / density) * jitter);
    this.schedule(() => {
      if (!this.running) return;
      this.tick();
      this.scheduleNext();
    }, delay);
  }

  private pick(families: ProceduralClip['family'][]): ProceduralClip {
    const pool = this.bank.filter((clip) => families.includes(clip.family));
    const mixedSeed = mixSeed(this.rng.nextUint(), Math.round(this.sensorSeed * this.settings.sensorMix));
    const local = new XorShift32(mixedSeed);
    return pool[local.int(pool.length)] ?? this.bank[0];
  }

  private tick() {
    if (this.mode === 'echoBox') this.echoBoxTick();
    else if (this.mode === 'fieldDrift') this.fieldDriftTick();
    else this.signalScanTick();
  }

  private echoBoxTick() {
    const clip = this.pick(['vocal', 'breath']);
    const rate = this.rng.range(0.84, 1.12 + this.settings.variation * 0.14);
    const volume = clamp01(this.settings.output * (0.54 + this.settings.texture * 0.3));
    this.play(clip, rate, volume, 'primary layer');

    const repeats = 1 + (this.rng.chance(this.settings.intensity * 0.7) ? 1 : 0);
    for (let i = 0; i < repeats; i += 1) {
      const delay = 125 + i * 165 + this.rng.range(0, 95);
      this.schedule(() => {
        if (this.running) this.play(clip, rate * this.rng.range(0.97, 1.03), volume * (0.48 - i * 0.12), `echo ${i + 1}`);
      }, delay);
    }
  }

  private fieldDriftTick() {
    if (this.rng.chance(0.18 + (1 - this.settings.intensity) * 0.12)) return;
    const clip = this.pick(this.rng.chance(0.58) ? ['reversed', 'vocal'] : ['breath', 'reversed']);
    const direction = this.rng.chance(0.5) ? -1 : 1;
    const drift = direction * this.settings.variation * this.rng.range(0.12, 0.5);
    const rate = Math.max(0.55, Math.min(1.75, 1 + drift));
    const volume = clamp01(this.settings.output * this.rng.range(0.42, 0.85));
    this.play(clip, rate, volume, clip.family === 'reversed' ? 'reverse drift' : 'rate drift');
  }

  private signalScanTick() {
    const bed = this.pick(['noise']);
    const texture = this.settings.texture;
    this.play(bed, this.rng.range(0.9, 1.08), clamp01(this.settings.output * (0.2 + texture * 0.32)), 'static gate');

    if (this.rng.chance(0.42 + this.settings.intensity * 0.38)) {
      const scan = this.pick(this.rng.chance(0.65) ? ['scan'] : ['vocal', 'reversed']);
      this.schedule(() => {
        if (this.running) this.play(scan, this.rng.range(0.72, 1.5), clamp01(this.settings.output * 0.5), 'scan gate');
      }, this.rng.range(45, 240));
    }
  }

  private play(clip: ProceduralClip, rate: number, volume: number, effect: string) {
    if (!clip?.uri || !this.running) return;
    const player = createAudioPlayer(clip.uri);
    this.players.add(player);
    try {
      player.volume = clamp01(volume);
      player.setPlaybackRate(Math.max(0.1, Math.min(2, rate)), 'low');
      player.play();
    } catch {
      this.players.delete(player);
      releasePlayer(player);
      return;
    }

    const now = Date.now();
    this.eventSink?.({
      id: `${now}-${this.rng.nextUint().toString(16)}`,
      atMs: Math.max(0, now - this.startedAt),
      sourceId: clip.id,
      family: clip.family,
      label: clip.label,
      effect,
      rate: Number(rate.toFixed(3)),
      volume: Number(volume.toFixed(3)),
      sensorInfluence: Number((this.sensorActivity * this.settings.sensorMix).toFixed(3)),
      provenance: 'ech0void-generated',
    });

    const lifetime = Math.min(2200, clip.durationMs / Math.max(rate, 0.2) + 220);
    this.schedule(() => {
      this.players.delete(player);
      releasePlayer(player);
    }, lifetime);
  }
}
