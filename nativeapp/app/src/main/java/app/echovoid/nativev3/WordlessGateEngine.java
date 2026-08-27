package app.echovoid.nativev3;

import android.content.Context;
import android.media.AudioAttributes;
import android.media.AudioFormat;
import android.media.AudioTrack;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.Random;
import java.util.concurrent.atomic.AtomicBoolean;

public final class WordlessGateEngine {
    public interface Listener {
        void onGateEvent(SessionStore.SourceEvent event);
        void onEngineError(String message);
    }

    private static final int OUTPUT_RATE = 22050;
    private static final int FRAME = 512;
    private static final float BASE_RATE = 0.50f;

    private final AudioBank bank;
    private final Listener listener;
    private final AtomicBoolean running = new AtomicBoolean(false);
    private final Random random = new Random();
    private final Object bankLock = new Object();

    private AudioTrack track;
    private Thread worker;

    private volatile float gateTarget;
    private volatile float output = 0.72f;
    private volatile float reverb = 0.42f;
    private volatile float sensorMix = 0.0f;
    private volatile float sensorActivity;
    private volatile long sensorSeed = 1L;
    private volatile String bankId = "mixed";
    private volatile String bankLabel = "Mixed Human";

    private float gateCurrent;
    private boolean gateWasOpen;
    private long gateOpenedAtMs;
    private long sessionStartedAtMs;

    private List<Chunk> chunks = new ArrayList<>();
    private int chunkIndex;
    private long localOutputSample;
    private long sequenceLoops;

    private double[] delayA = new double[1];
    private double[] delayB = new double[1];
    private int delayAIndex;
    private int delayBIndex;

    public WordlessGateEngine(Context context, Listener listener) throws Exception {
        this.bank = new AudioBank(context);
        this.listener = listener;
        rebuildBank("mixed", 0x45434830564f4944L);
        configureReverbBuffers();
    }

    public String[] bankIds() {
        return bank.bankIds();
    }

    public String bankLabel(String id) {
        return bank.bankLabel(id);
    }

    public void setBank(String id) {
        if (id == null) return;
        long seed = System.nanoTime() ^ sensorSeed ^ id.hashCode();
        rebuildBank(id, seed);
    }

    public String getBankId() {
        return bankId;
    }

    public String getBankLabel() {
        return bankLabel;
    }

    public void setGate(float amount) {
        float next = clamp01(amount);
        boolean opening = gateTarget < 0.05f && next >= 0.05f;
        boolean closing = gateTarget >= 0.05f && next < 0.05f;
        gateTarget = next;

        if (opening) {
            gateOpenedAtMs = System.currentTimeMillis();
            if (sensorMix > 0.001f) {
                sensorBiasJump();
            }
        } else if (closing) {
            emitGateWindow();
        }
    }

    public void setOutput(float value) {
        output = clamp01(value);
    }

    public void setReverb(float value) {
        reverb = clamp01(value);
    }

    public void setSensorMix(float value) {
        sensorMix = clamp01(value);
    }

    public void updateSensor(float activity, long seed) {
        sensorActivity = clamp01(activity);
        sensorSeed = seed;
    }

    public void start() {
        if (!bank.isReady()) {
            if (listener != null) listener.onEngineError("Wordless source bank is unavailable.");
            return;
        }
        if (!running.compareAndSet(false, true)) return;

        sessionStartedAtMs = System.currentTimeMillis();
        gateTarget = 0f;
        gateCurrent = 0f;
        gateWasOpen = false;

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
            if (listener != null) listener.onEngineError("Gate audio output failed: " + e.getMessage());
            return;
        }

        worker = new Thread(this::renderLoop, "Ech0VoidWordlessGate");
        worker.setPriority(Thread.MAX_PRIORITY);
        worker.start();
    }

    public void stop() {
        if (gateTarget >= 0.05f) {
            gateTarget = 0f;
            emitGateWindow();
        }

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
    }

    private void renderLoop() {
        short[] pcm = new short[FRAME];

        while (running.get()) {
            try {
                for (int i = 0; i < FRAME; i++) {
                    double raw = nextBankSample();

                    // Smooth the manual gate to avoid clicks while keeping it responsive.
                    float coefficient = gateTarget > gateCurrent ? 0.035f : 0.018f;
                    gateCurrent += (gateTarget - gateCurrent) * coefficient;

                    double gated = raw * gateCurrent;
                    double wet = processReverb(gated);
                    double mix = (gated * (1.0 - reverb * 0.16)) + (wet * reverb * 0.82);
                    mix *= output;

                    mix = Math.max(-1.0, Math.min(1.0, mix));
                    pcm[i] = (short) Math.round(mix * 32767.0);
                }

                if (track != null) {
                    int wrote = track.write(pcm, 0, pcm.length, AudioTrack.WRITE_BLOCKING);
                    if (wrote < 0) throw new IllegalStateException("Audio write error " + wrote);
                }
            } catch (Throwable t) {
                running.set(false);
                if (listener != null) listener.onEngineError("Wordless gate stopped: " + t.getMessage());
            }
        }
    }

    private double nextBankSample() {
        synchronized (bankLock) {
            if (chunks.isEmpty()) return 0.0;

            Chunk chunk = chunks.get(chunkIndex);
            if (localOutputSample >= chunk.outputLengthSamples) {
                advanceChunk();
                chunk = chunks.get(chunkIndex);
            }

            double sourcePerOutput =
                (chunk.source.sampleRate / (double) OUTPUT_RATE) * BASE_RATE;
            double sourceOffset = localOutputSample * sourcePerOutput;
            double sourcePosition = (chunk.sourceStart + chunk.sourceLength - 1) - sourceOffset;

            int min = chunk.sourceStart;
            int max = chunk.sourceStart + chunk.sourceLength - 1;
            int i0 = clamp((int) Math.floor(sourcePosition), min, max);
            int i1 = clamp(i0 - 1, min, max);

            double frac = Math.abs(sourcePosition - Math.floor(sourcePosition));
            double a = (((chunk.source.pcm[i0] & 0xff) - 128) / 128.0);
            double b = (((chunk.source.pcm[i1] & 0xff) - 128) / 128.0);
            localOutputSample++;

            // Mild high-pass-ish difference removes some muddy DC/rumble from old voice files.
            return (a + (b - a) * frac) * 0.92;
        }
    }

    private void advanceChunk() {
        localOutputSample = 0;
        chunkIndex++;
        if (chunkIndex >= chunks.size()) {
            chunkIndex = 0;
            sequenceLoops++;
            Collections.shuffle(chunks, new Random(sensorSeed ^ System.nanoTime() ^ sequenceLoops));
        }
    }

    private void rebuildBank(String id, long seed) {
        List<AudioBank.Source> sources = bank.sourcesForBank(id);
        List<Chunk> next = new ArrayList<>();

        for (AudioBank.Source source : sources) {
            // Josh's published HSB method is reverse -> about 50% speed -> chop into
            // roughly two-second pieces -> randomize. At half-speed, one second of source
            // becomes ~two seconds of output, so we chunk source audio in ~1 s sections.
            int sourceChunk = Math.max(256, source.sampleRate);
            for (int start = 0; start < source.pcm.length; start += sourceChunk) {
                int length = Math.min(sourceChunk, source.pcm.length - start);
                if (length < source.sampleRate / 5) continue;
                next.add(new Chunk(source, start, length));
            }
        }

        if (next.isEmpty()) return;
        Collections.shuffle(next, new Random(seed));

        synchronized (bankLock) {
            chunks = next;
            chunkIndex = 0;
            localOutputSample = 0;
            sequenceLoops = 0;
            bankId = id;
            bankLabel = bank.bankLabel(id);
        }
    }

    private void sensorBiasJump() {
        synchronized (bankLock) {
            if (chunks.isEmpty()) return;

            long mixed = sensorSeed
                ^ ((long) (sensorActivity * 1_000_003f))
                ^ ((long) (sensorMix * 31_337f));

            Random local = new Random(mixed);
            int candidate = local.nextInt(chunks.size());

            // Sensor Mix determines how strongly the sensor-selected position replaces
            // the natural continuously-running bank position.
            if (local.nextFloat() < sensorMix) {
                chunkIndex = candidate;
                localOutputSample = 0;
            }
        }
    }

    private void emitGateWindow() {
        long opened = gateOpenedAtMs;
        if (opened <= 0) return;

        long now = System.currentTimeMillis();
        long duration = Math.max(1, now - opened);
        gateOpenedAtMs = 0;

        if (listener == null) return;

        SessionStore.SourceEvent event = new SessionStore.SourceEvent();
        event.offsetMs = Math.max(0, opened - sessionStartedAtMs);
        event.sourceId = "wordless-bank:" + bankId + ":loop" + sequenceLoops + ":chunk" + chunkIndex;
        event.family = "wordless-human-bank";
        event.label = bankLabel + " gate window";
        event.effect = String.format(
            Locale.US,
            "manual-gate %.2fs / reversed / 50%% speed / reverb %.0f%%",
            duration / 1000.0,
            reverb * 100f
        );
        event.rate = BASE_RATE;
        event.volume = output;
        event.sensorInfluence = clamp01(sensorActivity * sensorMix);
        listener.onGateEvent(event);
    }

    private void configureReverbBuffers() {
        delayA = new double[Math.max(1, Math.round(OUTPUT_RATE * 0.093f))];
        delayB = new double[Math.max(1, Math.round(OUTPUT_RATE * 0.157f))];
        delayAIndex = 0;
        delayBIndex = 0;
    }

    private double processReverb(double input) {
        double a = delayA[delayAIndex];
        double b = delayB[delayBIndex];

        double feedbackA = 0.28 + reverb * 0.34;
        double feedbackB = 0.22 + reverb * 0.30;

        delayA[delayAIndex] = input + a * feedbackA + b * 0.08;
        delayB[delayBIndex] = input * 0.72 + b * feedbackB + a * 0.06;

        delayAIndex++;
        if (delayAIndex >= delayA.length) delayAIndex = 0;
        delayBIndex++;
        if (delayBIndex >= delayB.length) delayBIndex = 0;

        return a * 0.58 + b * 0.42;
    }

    private static final class Chunk {
        final AudioBank.Source source;
        final int sourceStart;
        final int sourceLength;
        final long outputLengthSamples;

        Chunk(AudioBank.Source source, int sourceStart, int sourceLength) {
            this.source = source;
            this.sourceStart = sourceStart;
            this.sourceLength = sourceLength;
            this.outputLengthSamples = Math.max(
                1,
                Math.round(
                    sourceLength
                        * (OUTPUT_RATE / (double) source.sampleRate)
                        / BASE_RATE
                )
            );
        }
    }

    private static int clamp(int value, int min, int max) {
        return Math.max(min, Math.min(max, value));
    }

    private static float clamp01(float value) {
        return Math.max(0f, Math.min(1f, value));
    }
}
