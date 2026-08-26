package app.echovoid.nativev3;

import android.media.AudioAttributes;
import android.media.AudioFormat;
import android.media.AudioManager;
import android.media.AudioTrack;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Random;
import java.util.concurrent.atomic.AtomicBoolean;

public final class Ech0Engine {
    public enum Mode { ECHO_BOX, FIELD_DRIFT, SIGNAL_SCAN }

    public interface Listener {
        void onSourceEvent(SessionStore.SourceEvent event);
        void onEngineError(String message);
    }

    private static final int SAMPLE_RATE = 22050;
    private static final int FRAME = 512;

    private final Mode mode;
    private final Listener listener;
    private final AtomicBoolean running = new AtomicBoolean(false);
    private final List<Voice> voices = new ArrayList<>();
    private final Random random = new Random();

    private volatile float intensity = 0.62f;
    private volatile float variation = 0.55f;
    private volatile float texture = 0.55f;
    private volatile float sensorMix = 0.45f;
    private volatile float output = 0.68f;
    private volatile float sensorActivity = 0f;
    private volatile long sensorSeed = 1L;

    private AudioTrack track;
    private Thread worker;
    private long sampleCursor;
    private long nextEventSample;
    private long sessionStartedAt;
    private float noiseState;

    public Ech0Engine(Mode mode, Listener listener) {
        this.mode = mode;
        this.listener = listener;
    }

    public void setSettings(float intensity, float variation, float texture, float sensorMix, float output) {
        this.intensity = clamp01(intensity);
        this.variation = clamp01(variation);
        this.texture = clamp01(texture);
        this.sensorMix = clamp01(sensorMix);
        this.output = clamp01(output);
    }

    public void updateSensor(float activity, long seed) {
        sensorActivity = clamp01(activity);
        sensorSeed = seed;
    }

    public void start() {
        if (!running.compareAndSet(false, true)) return;
        sessionStartedAt = System.currentTimeMillis();
        sampleCursor = 0;
        nextEventSample = 0;

        int minBuffer = AudioTrack.getMinBufferSize(
            SAMPLE_RATE,
            AudioFormat.CHANNEL_OUT_MONO,
            AudioFormat.ENCODING_PCM_16BIT
        );
        int bufferSize = Math.max(minBuffer, FRAME * 8);

        try {
            track = new AudioTrack.Builder()
                .setAudioAttributes(new AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_MEDIA)
                    .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                    .build())
                .setAudioFormat(new AudioFormat.Builder()
                    .setSampleRate(SAMPLE_RATE)
                    .setEncoding(AudioFormat.ENCODING_PCM_16BIT)
                    .setChannelMask(AudioFormat.CHANNEL_OUT_MONO)
                    .build())
                .setTransferMode(AudioTrack.MODE_STREAM)
                .setBufferSizeInBytes(bufferSize)
                .build();
            track.play();
        } catch (Exception e) {
            running.set(false);
            if (listener != null) listener.onEngineError("AudioTrack failed: " + e.getMessage());
            return;
        }

        emitStaticBedIfNeeded();

        worker = new Thread(this::renderLoop, "Ech0VoidAudio");
        worker.setPriority(Thread.MAX_PRIORITY);
        worker.start();
    }

    public void stop() {
        running.set(false);
        if (worker != null) {
            try { worker.join(800); } catch (InterruptedException ignored) {}
            worker = null;
        }
        if (track != null) {
            try { track.pause(); } catch (Exception ignored) {}
            try { track.flush(); } catch (Exception ignored) {}
            try { track.stop(); } catch (Exception ignored) {}
            try { track.release(); } catch (Exception ignored) {}
            track = null;
        }
        synchronized (voices) {
            voices.clear();
        }
    }

    private void renderLoop() {
        short[] pcm = new short[FRAME];
        while (running.get()) {
            try {
                if (sampleCursor >= nextEventSample) scheduleEvent();

                for (int i = 0; i < FRAME; i++) {
                    double mix = backgroundSample(sampleCursor + i);
                    synchronized (voices) {
                        Iterator<Voice> it = voices.iterator();
                        while (it.hasNext()) {
                            Voice v = it.next();
                            long local = (sampleCursor + i) - v.startSample;
                            if (local < 0) continue;
                            if (local >= v.durationSamples) {
                                it.remove();
                                continue;
                            }
                            mix += v.sample(local);
                        }
                    }
                    mix *= output;
                    mix = Math.max(-1.0, Math.min(1.0, mix));
                    pcm[i] = (short) Math.round(mix * 32767.0);
                }

                if (track != null) {
                    int wrote = track.write(pcm, 0, pcm.length, AudioTrack.WRITE_BLOCKING);
                    if (wrote < 0) throw new IllegalStateException("Audio write error " + wrote);
                }
                sampleCursor += FRAME;
            } catch (Throwable t) {
                running.set(false);
                if (listener != null) listener.onEngineError("Audio engine stopped: " + t.getMessage());
            }
        }
    }

    private double backgroundSample(long sample) {
        if (mode != Mode.SIGNAL_SCAN) return 0.0;
        double seconds = sample / (double) SAMPLE_RATE;
        double gateSpeed = 5.0 + variation * 11.0;
        double gate = Math.sin(seconds * Math.PI * 2.0 * gateSpeed) > (0.15 - texture * 0.5) ? 1.0 : 0.18;
        double white = random.nextDouble() * 2.0 - 1.0;
        noiseState = noiseState * 0.82f + (float) white * 0.18f;
        double amount = 0.025 + texture * 0.12;
        return noiseState * amount * gate;
    }

    private void scheduleEvent() {
        long seed = sensorSeed ^ sampleCursor ^ (long) (sensorActivity * 1_000_003);
        random.setSeed(seed + random.nextLong());

        float influence = clamp01(sensorActivity * sensorMix);
        if (mode == Mode.ECHO_BOX) {
            scheduleEchoBox(influence);
        } else if (mode == Mode.FIELD_DRIFT) {
            scheduleFieldDrift(influence);
        } else {
            scheduleSignalScan(influence);
        }

        double baseMs;
        if (mode == Mode.ECHO_BOX) baseMs = 1250 - intensity * 700;
        else if (mode == Mode.FIELD_DRIFT) baseMs = 1050 - intensity * 650;
        else baseMs = 820 - intensity * 500;

        double jitter = 0.55 + random.nextDouble() * (0.8 + variation * 1.2);
        double sensorAcceleration = 1.0 - influence * 0.45;
        long wait = (long) ((baseMs * jitter * sensorAcceleration) * SAMPLE_RATE / 1000.0);
        nextEventSample = sampleCursor + Math.max(SAMPLE_RATE / 10, wait);
    }

    private void scheduleEchoBox(float influence) {
        int vowel = random.nextInt(5);
        String label = "vowel-" + "aeiou".charAt(vowel);
        double rate = 0.78 + random.nextDouble() * (0.35 + variation * 0.35);
        long dur = msToSamples((long) (280 + random.nextDouble() * 360));
        float amp = 0.20f + intensity * 0.25f;
        long base = sampleCursor + msToSamples((long) (random.nextDouble() * 90));

        addVoice(Voice.vowel(base, dur, 155 + vowel * 27, amp, rate, false, texture), "voice-like", label, "primary", (float) rate, amp, influence);
        addVoice(Voice.vowel(base + msToSamples(115), dur, 155 + vowel * 27, amp * 0.52f, rate * 0.985, false, texture), "voice-like", label, "echo-1", (float) rate, amp * 0.52f, influence);
        if (intensity > 0.45f) {
            addVoice(Voice.vowel(base + msToSamples(245), dur, 155 + vowel * 27, amp * 0.30f, rate * 1.015, false, texture), "voice-like", label, "echo-2", (float) rate, amp * 0.30f, influence);
        }
        if (texture > 0.65f && random.nextFloat() < texture * 0.45f) {
            long breathDur = msToSamples(220 + random.nextInt(320));
            addVoice(Voice.breath(base + msToSamples(45), breathDur, 0.10f + texture * 0.13f, false), "breath", "breath-fragment", "layer", 1f, 0.16f, influence);
        }
    }

    private void scheduleFieldDrift(float influence) {
        if (random.nextFloat() < 0.10f + variation * 0.16f) {
            emitEvent("silence-gate", "gate", "dropout", "drift-mute", 1f, 0f, influence);
            return;
        }

        boolean reverse = random.nextFloat() < (0.28f + variation * 0.42f);
        boolean breath = random.nextFloat() < 0.22f;
        double rate = 0.52 + random.nextDouble() * (0.75 + variation * 0.9);
        long dur = msToSamples(180 + random.nextInt(520));
        float amp = 0.18f + intensity * 0.30f;
        long start = sampleCursor + msToSamples(random.nextInt(120));

        if (breath) {
            addVoice(Voice.breath(start, dur, amp * 0.75f, reverse), "breath", reverse ? "reverse-breath" : "breath-fragment", reverse ? "reverse" : "drift", (float) rate, amp, influence);
        } else {
            int vowel = random.nextInt(5);
            String label = (reverse ? "reverse-" : "") + "vowel-" + "aeiou".charAt(vowel);
            addVoice(Voice.vowel(start, dur, 125 + vowel * 32, amp, rate, reverse, texture), "voice-like", label, reverse ? "reverse-drift" : "rate-drift", (float) rate, amp, influence);
        }
    }

    private void scheduleSignalScan(float influence) {
        if (random.nextFloat() < 0.72f) {
            double startHz = 320 + random.nextDouble() * 2100;
            double endHz = 180 + random.nextDouble() * 4200;
            long dur = msToSamples(80 + random.nextInt(260));
            float amp = 0.08f + texture * 0.16f;
            addVoice(Voice.chirp(sampleCursor, dur, startHz, endHz, amp), "scan", "scan-chirp", "frequency-sweep", 1f, amp, influence);
        }

        if (random.nextFloat() < 0.17f + intensity * 0.22f) {
            int vowel = random.nextInt(5);
            long dur = msToSamples(100 + random.nextInt(240));
            float amp = 0.11f + intensity * 0.18f;
            double rate = 0.75 + random.nextDouble() * 0.8;
            addVoice(Voice.vowel(sampleCursor + msToSamples(30), dur, 170 + vowel * 35, amp, rate, random.nextBoolean(), texture), "voice-like", "sparse-vowel-" + "aeiou".charAt(vowel), "scan-gate", (float) rate, amp, influence);
        }
    }

    private void emitStaticBedIfNeeded() {
        if (mode == Mode.SIGNAL_SCAN) {
            emitEvent("static-bed", "static", "procedural-static", "continuous-gated-bed", 1f, 0.12f, 0f);
        }
    }

    private void addVoice(Voice voice, String family, String label, String effect, float rate, float volume, float influence) {
        synchronized (voices) {
            voices.add(voice);
        }
        emitEvent("src-" + Long.toHexString(sampleCursor) + "-" + Integer.toHexString(random.nextInt()), family, label, effect, rate, volume, influence);
    }

    private void emitEvent(String sourceId, String family, String label, String effect, float rate, float volume, float influence) {
        if (listener == null) return;
        SessionStore.SourceEvent event = new SessionStore.SourceEvent();
        event.offsetMs = Math.max(0, System.currentTimeMillis() - sessionStartedAt);
        event.sourceId = sourceId;
        event.family = family;
        event.label = label;
        event.effect = effect;
        event.rate = rate;
        event.volume = volume;
        event.sensorInfluence = influence;
        listener.onSourceEvent(event);
    }

    private static long msToSamples(long ms) {
        return Math.max(1, ms * SAMPLE_RATE / 1000L);
    }

    private static float clamp01(float x) {
        return Math.max(0f, Math.min(1f, x));
    }

    private static final class Voice {
        final int kind;
        final long startSample;
        final long durationSamples;
        final double freqA;
        final double freqB;
        final double amplitude;
        final double rate;
        final boolean reverse;
        final double texture;
        double phase;
        final Random noise = new Random();

        private Voice(int kind, long startSample, long durationSamples, double freqA, double freqB, double amplitude, double rate, boolean reverse, double texture) {
            this.kind = kind;
            this.startSample = startSample;
            this.durationSamples = durationSamples;
            this.freqA = freqA;
            this.freqB = freqB;
            this.amplitude = amplitude;
            this.rate = rate;
            this.reverse = reverse;
            this.texture = texture;
        }

        static Voice vowel(long start, long dur, double freq, double amp, double rate, boolean reverse, double texture) {
            return new Voice(0, start, dur, freq, freq, amp, rate, reverse, texture);
        }

        static Voice breath(long start, long dur, double amp, boolean reverse) {
            return new Voice(1, start, dur, 0, 0, amp, 1, reverse, 0.5);
        }

        static Voice chirp(long start, long dur, double fromHz, double toHz, double amp) {
            return new Voice(2, start, dur, fromHz, toHz, amp, 1, false, 0.5);
        }

        double sample(long local) {
            double p = local / (double) Math.max(1, durationSamples - 1);
            double env;
            if (reverse) {
                env = Math.pow(p, 0.42) * Math.pow(1.0 - p, 2.9);
            } else {
                env = Math.pow(Math.max(0, Math.sin(Math.PI * p)), 0.72);
            }

            if (kind == 1) {
                double n = noise.nextDouble() * 2.0 - 1.0;
                return n * amplitude * env;
            }

            if (kind == 2) {
                double hz = freqA + (freqB - freqA) * p;
                phase += Math.PI * 2.0 * hz / SAMPLE_RATE;
                return Math.sin(phase) * amplitude * env;
            }

            double base = freqA * rate;
            double f1 = base * (3.0 + texture * 0.8);
            double f2 = base * (5.2 + texture * 1.6);
            double f3 = base * (8.0 + texture * 2.2);
            phase += Math.PI * 2.0 * base / SAMPLE_RATE;
            double s = Math.sin(phase) * 0.34
                + Math.sin(phase * (f1 / base)) * 0.40
                + Math.sin(phase * (f2 / base)) * 0.18
                + Math.sin(phase * (f3 / base)) * 0.08;
            return s * amplitude * env;
        }
    }
}
