package app.echovoid.nativev3;

import android.content.Context;
import android.media.AudioAttributes;
import android.media.AudioFormat;
import android.media.AudioTrack;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Locale;
import java.util.Random;
import java.util.concurrent.atomic.AtomicBoolean;

public final class Ech0Engine {
    public enum Mode { ECHO_BOX, FIELD_DRIFT, SIGNAL_SCAN }

    public interface Listener {
        void onSourceEvent(SessionStore.SourceEvent event);
        void onEngineError(String message);
    }

    private static final int OUTPUT_RATE = 22050;
    private static final int FRAME = 512;

    private final Mode mode;
    private final Listener listener;
    private final AudioBank bank;
    private final AtomicBoolean running = new AtomicBoolean(false);
    private final List<Voice> voices = new ArrayList<>();
    private final Random random = new Random();

    private volatile float intensity = 0.45f;
    private volatile float variation = 0.50f;
    private volatile float texture = 0.45f;
    private volatile float sensorMix = 0.50f;
    private volatile float output = 0.68f;
    private volatile float sensorActivity = 0f;
    private volatile long sensorSeed = 1L;

    private AudioTrack track;
    private Thread worker;
    private long sampleCursor;
    private long nextEventSample;
    private long sessionStartedAt;

    public Ech0Engine(Context context, Mode mode, Listener listener) throws Exception {
        this.mode = mode;
        this.listener = listener;
        this.bank = new AudioBank(context);
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
        if (!bank.isReady()) {
            if (listener != null) listener.onEngineError("Recorded source bank is unavailable.");
            return;
        }
        if (!running.compareAndSet(false, true)) return;

        sessionStartedAt = System.currentTimeMillis();
        sampleCursor = 0;
        nextEventSample = msToOutputSamples(350);

        int minBuffer = AudioTrack.getMinBufferSize(
            OUTPUT_RATE,
            AudioFormat.CHANNEL_OUT_MONO,
            AudioFormat.ENCODING_PCM_16BIT
        );
        int bufferSize = Math.max(minBuffer, FRAME * 8);

        try {
            track = new AudioTrack.Builder()
                .setAudioAttributes(new AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_MEDIA)
                    .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
                    .build())
                .setAudioFormat(new AudioFormat.Builder()
                    .setSampleRate(OUTPUT_RATE)
                    .setEncoding(AudioFormat.ENCODING_PCM_16BIT)
                    .setChannelMask(AudioFormat.CHANNEL_OUT_MONO)
                    .build())
                .setTransferMode(AudioTrack.MODE_STREAM)
                .setBufferSizeInBytes(bufferSize)
                .build();
            track.play();
        } catch (Exception e) {
            running.set(false);
            if (listener != null) listener.onEngineError("Audio output failed: " + e.getMessage());
            return;
        }

        worker = new Thread(this::renderLoop, "Ech0VoidRecordedBankAudio");
        worker.setPriority(Thread.MAX_PRIORITY);
        worker.start();
    }

    public void stop() {
        running.set(false);
        if (worker != null) {
            try { worker.join(900); } catch (InterruptedException ignored) {}
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
                if (sampleCursor >= nextEventSample) {
                    scheduleCluster();
                    nextEventSample = sampleCursor + calculateGapSamples();
                }

                for (int i = 0; i < FRAME; i++) {
                    long absolute = sampleCursor + i;
                    double mix = 0.0;

                    synchronized (voices) {
                        Iterator<Voice> it = voices.iterator();
                        while (it.hasNext()) {
                            Voice voice = it.next();
                            long local = absolute - voice.startOutputSample;
                            if (local < 0) continue;
                            if (local >= voice.durationOutputSamples) {
                                it.remove();
                                continue;
                            }
                            mix += voice.sample(local);
                        }
                    }

                    // Silence is intentionally the default state.
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

    private long calculateGapSamples() {
        double baseMs;
        switch (mode) {
            case ECHO_BOX:
                baseMs = lerp(5200, 1500, intensity);
                break;
            case FIELD_DRIFT:
                baseMs = lerp(4000, 900, intensity);
                break;
            default:
                baseMs = lerp(3200, 750, intensity);
                break;
        }

        random.setSeed(sensorSeed ^ sampleCursor ^ 0x6a09e667f3bcc909L);
        double jitter = 0.68 + random.nextDouble() * (0.72 + variation * 0.85);

        // At high Sensor Mix, quiet sensor periods become quieter and sensor activity
        // shortens the wait. The sensor never invents content; it only biases timing/choice.
        double sensorGate = 1.0 + sensorMix * (0.85 - sensorActivity * 2.20);
        sensorGate = Math.max(0.38, Math.min(2.0, sensorGate));

        return msToOutputSamples((long) Math.max(260, baseMs * jitter * sensorGate));
    }

    private void scheduleCluster() {
        long seed = sensorSeed ^ sampleCursor ^ ((long) (sensorActivity * 1_000_003f));
        random.setSeed(seed + 0x9e3779b97f4a7c15L);

        float influence = clamp01(sensorActivity * sensorMix);

        if (mode == Mode.ECHO_BOX) {
            scheduleEchoBox(influence);
        } else if (mode == Mode.FIELD_DRIFT) {
            scheduleFieldDrift(influence);
        } else {
            scheduleSignalScan(influence);
        }
    }

    private void scheduleEchoBox(float influence) {
        float baseGain = 0.34f + intensity * 0.24f;
        AudioBank.FragmentSpec fragment = bank.pick(
            random.nextLong() ^ sensorSeed,
            85,
            210,
            0.86f,
            1.14f + variation * 0.16f,
            false,
            baseGain
        );
        if (fragment == null) return;

        long start = sampleCursor + msToOutputSamples(10 + random.nextInt(90));
        addFragment(fragment, start, "primary");

        // Echoes repeat the exact recorded micro-fragment. They do not generate a new tone.
        if (intensity > 0.16f) {
            long echo1 = start + msToOutputSamples(145 + random.nextInt(120));
            addFragment(copyWithGain(fragment, fragment.gain * 0.48f), echo1, "echo-1");
        }
        if (intensity > 0.62f && random.nextFloat() < intensity) {
            long echo2 = start + msToOutputSamples(340 + random.nextInt(170));
            addFragment(copyWithGain(fragment, fragment.gain * 0.25f), echo2, "echo-2");
        }

        // Dense settings may briefly overlap a different human slice, but silence remains
        // between clusters.
        if (intensity > 0.70f && random.nextFloat() < 0.42f) {
            AudioBank.FragmentSpec second = bank.pick(
                random.nextLong(),
                70,
                160,
                0.90f,
                1.18f,
                false,
                baseGain * 0.62f
            );
            if (second != null) addFragment(second, start + msToOutputSamples(35 + random.nextInt(110)), "overlap");
        }
    }

    private void scheduleFieldDrift(float influence) {
        int count = 1 + (int) Math.floor(intensity * 3.0f);
        if (random.nextFloat() < 0.28f + variation * 0.30f) count++;

        long cursor = sampleCursor + msToOutputSamples(15 + random.nextInt(120));
        for (int i = 0; i < count; i++) {
            // Deliberate holes inside a cluster.
            if (random.nextFloat() < 0.18f + variation * 0.16f) {
                emitSilenceEvent(cursor, 80 + random.nextInt(220), influence);
                cursor += msToOutputSamples(120 + random.nextInt(260));
                continue;
            }

            boolean reverse = random.nextFloat() < 0.64f;
            float minRate = 0.58f;
            float maxRate = 1.18f + variation * 0.82f;
            float gain = 0.28f + intensity * 0.28f;

            AudioBank.FragmentSpec fragment = bank.pick(
                random.nextLong() ^ sensorSeed,
                65,
                190,
                minRate,
                maxRate,
                reverse,
                gain
            );

            if (fragment != null) {
                addFragment(fragment, cursor, fragment.reverse ? "reverse-drift" : "rate-drift");
            }

            cursor += msToOutputSamples(75 + random.nextInt(150 + Math.round(variation * 220)));
        }
    }

    private void scheduleSignalScan(float influence) {
        int steps = 4 + Math.round(intensity * 8f);
        long stepGapMs = Math.round(lerp(135, 58, variation));
        long cursor = sampleCursor + msToOutputSamples(10);

        for (int i = 0; i < steps; i++) {
            // A ghost-box-style scan is a sequence of very short gated windows, followed
            // by a real pause before the next sweep. It is not a continuous noise bed.
            boolean staticStep = random.nextFloat() < (0.12f + texture * 0.34f);

            if (staticStep) {
                int ms = 28 + random.nextInt(55);
                float gain = 0.05f + texture * 0.13f;
                addNoiseBurst(cursor, ms, gain, influence);
            } else {
                int maxMs = 70 + Math.round((1f - variation) * 45f);
                AudioBank.FragmentSpec fragment = bank.pick(
                    random.nextLong() ^ (sensorSeed + i * 131L),
                    35,
                    Math.max(55, maxMs),
                    0.78f,
                    1.22f + variation * 0.65f,
                    random.nextFloat() < 0.18f,
                    0.20f + intensity * 0.20f
                );
                if (fragment != null) addFragment(fragment, cursor, "scan-window");
            }

            cursor += msToOutputSamples(stepGapMs + random.nextInt(35));
        }
    }

    private void addFragment(AudioBank.FragmentSpec spec, long start, String effect) {
        SourceVoice voice = new SourceVoice(start, spec);
        synchronized (voices) {
            voices.add(voice);
        }

        String sourceId = spec.source.id + "@" + spec.startMs() + "+" + spec.lengthMs();
        String label = spec.source.label + " slice";
        emitEvent(
            sourceId,
            "recorded-fragment",
            label,
            effect + (spec.reverse ? "/reverse" : ""),
            spec.rate,
            spec.gain,
            clamp01(sensorActivity * sensorMix)
        );
    }

    private void addNoiseBurst(long start, int durationMs, float gain, float influence) {
        synchronized (voices) {
            voices.add(new NoiseBurst(start, msToOutputSamples(durationMs), gain, random.nextLong()));
        }
        emitEvent(
            "generated-static@" + (System.currentTimeMillis() - sessionStartedAt),
            "static",
            "short static gate",
            "scan-static-window",
            1f,
            gain,
            influence
        );
    }

    private void emitSilenceEvent(long start, int durationMs, float influence) {
        long atMs = Math.max(0, Math.round(start * 1000f / OUTPUT_RATE));
        if (listener == null) return;
        SessionStore.SourceEvent event = new SessionStore.SourceEvent();
        event.offsetMs = atMs;
        event.sourceId = "silence-gap";
        event.family = "gate";
        event.label = "deliberate dropout";
        event.effect = "mute-window";
        event.rate = 1f;
        event.volume = 0f;
        event.sensorInfluence = influence;
        listener.onSourceEvent(event);
    }

    private void emitEvent(
        String sourceId,
        String family,
        String label,
        String effect,
        float rate,
        float volume,
        float influence
    ) {
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

    private static AudioBank.FragmentSpec copyWithGain(AudioBank.FragmentSpec src, float gain) {
        return new AudioBank.FragmentSpec(src.source, src.start, src.length, src.rate, src.reverse, gain);
    }

    private static long msToOutputSamples(long ms) {
        return Math.max(1, ms * OUTPUT_RATE / 1000L);
    }

    private static double lerp(double from, double to, double t) {
        return from + (to - from) * Math.max(0.0, Math.min(1.0, t));
    }

    private static float clamp01(float x) {
        return Math.max(0f, Math.min(1f, x));
    }

    private abstract static class Voice {
        final long startOutputSample;
        final long durationOutputSamples;

        Voice(long startOutputSample, long durationOutputSamples) {
            this.startOutputSample = startOutputSample;
            this.durationOutputSamples = durationOutputSamples;
        }

        abstract double sample(long localOutputSample);

        double envelope(long local) {
            double p = local / (double) Math.max(1, durationOutputSamples - 1);
            double fade = Math.min(0.22, 0.025 + 400.0 / Math.max(4000.0, durationOutputSamples));
            if (p < fade) return p / fade;
            if (p > 1.0 - fade) return (1.0 - p) / fade;
            return 1.0;
        }
    }

    private static final class SourceVoice extends Voice {
        final AudioBank.FragmentSpec spec;
        final double sourcePerOutput;

        SourceVoice(long startOutputSample, AudioBank.FragmentSpec spec) {
            super(
                startOutputSample,
                Math.max(
                    1,
                    Math.round(
                        spec.length * (OUTPUT_RATE / (double) spec.source.sampleRate) / Math.max(0.25, spec.rate)
                    )
                )
            );
            this.spec = spec;
            this.sourcePerOutput = (spec.source.sampleRate / (double) OUTPUT_RATE) * spec.rate;
        }

        @Override
        double sample(long localOutputSample) {
            double rel = localOutputSample * sourcePerOutput;
            double src;
            if (spec.reverse) src = spec.start + spec.length - 1 - rel;
            else src = spec.start + rel;

            int i0 = (int) Math.floor(src);
            int i1 = i0 + (spec.reverse ? -1 : 1);

            int min = spec.start;
            int max = spec.start + spec.length - 1;
            i0 = Math.max(min, Math.min(max, i0));
            i1 = Math.max(min, Math.min(max, i1));

            double frac = Math.abs(src - Math.floor(src));
            double a = spec.source.pcm[i0] / 32768.0;
            double b = spec.source.pcm[i1] / 32768.0;
            double value = a + (b - a) * frac;

            return value * spec.gain * envelope(localOutputSample);
        }
    }

    private static final class NoiseBurst extends Voice {
        final float gain;
        final Random random;
        double filtered;

        NoiseBurst(long start, long duration, float gain, long seed) {
            super(start, duration);
            this.gain = gain;
            this.random = new Random(seed);
        }

        @Override
        double sample(long local) {
            double white = random.nextDouble() * 2.0 - 1.0;
            filtered = filtered * 0.58 + white * 0.42;
            return filtered * gain * envelope(local);
        }
    }
}
