package app.echovoid.nativev3;

import android.content.Context;
import android.media.AudioAttributes;
import android.media.AudioFormat;
import android.media.AudioTrack;

import java.util.Locale;
import java.util.Random;
import java.util.concurrent.atomic.AtomicBoolean;

public final class WordlessGateEngine {
    public interface Listener {
        void onGateEvent(SessionStore.SourceEvent event);
        void onEngineError(String message);
    }

    private static final int FRAME = 512;

    private final Context context;
    private final AudioBank bank;
    private final Listener listener;
    private final AtomicBoolean running = new AtomicBoolean(false);
    private final Object bankLock = new Object();
    private final Random random = new Random();

    private AudioTrack track;
    private Thread worker;
    private AudioBank.LongBank activeBank;

    private volatile float gateTarget;
    private volatile float gateCurrent;
    private volatile float output = 0.72f;
    private volatile float reverb = 0.30f;
    private volatile float sensorMix = 0f;
    private volatile float sensorActivity;
    private volatile long sensorSeed = 1L;
    private volatile String bankId = "voidmix";
    private volatile String bankLabel = "VOID MIX • all source families";

    private long bankCursor;
    private long sessionStartedAtMs;
    private long gateOpenedAtMs;
    private long gateOpenedAtCursor;

    private double[] delayA = new double[1];
    private double[] delayB = new double[1];
    private int delayAIndex;
    private int delayBIndex;

    public WordlessGateEngine(Context context, Listener listener) throws Exception {
        this.context = context.getApplicationContext();
        this.bank = new AudioBank(context);
        this.listener = listener;
        loadBank("voidmix", false);
    }

    public String[] bankIds() {
        return bank.realBankIds();
    }

    public String bankLabel(String id) {
        return bank.realBankLabel(id);
    }

    public void setBank(String id) {
        try {
            loadBank(id, true);
        } catch (Exception e) {
            if (listener != null) listener.onEngineError("Bank load failed: " + e.getMessage());
        }
    }

    public String getBankId() {
        return bankId;
    }

    public String getBankLabel() {
        return bankLabel;
    }

    public void reshufflePosition() {
        synchronized (bankLock) {
            if (activeBank == null || activeBank.pcm.length == 0) return;
            random.setSeed(System.nanoTime() ^ sensorSeed ^ bankId.hashCode());
            bankCursor = random.nextInt(activeBank.pcm.length);
        }
    }

    public void setGate(float amount) {
        float next = clamp01(amount);
        boolean opening = gateTarget < 0.05f && next >= 0.05f;
        boolean closing = gateTarget >= 0.05f && next < 0.05f;
        gateTarget = next;

        if (opening) {
            gateOpenedAtMs = System.currentTimeMillis();
            synchronized (bankLock) {
                gateOpenedAtCursor = bankCursor;
            }
            if (sensorMix > 0.001f) sensorBiasPosition();
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
        if (activeBank == null || activeBank.pcm.length == 0) {
            if (listener != null) listener.onEngineError("Long wordless bank is unavailable.");
            return;
        }
        if (!running.compareAndSet(false, true)) return;

        sessionStartedAtMs = System.currentTimeMillis();
        gateTarget = 0f;
        gateCurrent = 0f;
        configureReverbBuffers(activeBank.sampleRate);

        int minBuffer = AudioTrack.getMinBufferSize(
            activeBank.sampleRate,
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
                    .setSampleRate(activeBank.sampleRate)
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

        worker = new Thread(this::renderLoop, "Ech0VoidLongBankGate");
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
                    double raw;
                    synchronized (bankLock) {
                        if (activeBank == null || activeBank.pcm.length == 0) {
                            raw = 0.0;
                        } else {
                            raw = activeBank.pcm[(int) bankCursor] / 32768.0;
                            bankCursor++;
                            if (bankCursor >= activeBank.pcm.length) bankCursor = 0;
                        }
                    }

                    float coefficient = gateTarget > gateCurrent ? 0.045f : 0.020f;
                    gateCurrent += (gateTarget - gateCurrent) * coefficient;

                    double gated = raw * gateCurrent;
                    double wet = processReverb(gated);
                    double mix = gated * (1.0 - reverb * 0.12) + wet * reverb * 0.76;
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
                if (listener != null) listener.onEngineError("Long-bank gate stopped: " + t.getMessage());
            }
        }
    }

    private void loadBank(String id, boolean randomStart) throws Exception {
        AudioBank.LongBank next = bank.loadRealBank(context, id);
        synchronized (bankLock) {
            activeBank = next;
            bankId = next.id;
            bankLabel = next.label;
            if (randomStart) {
                random.setSeed(System.nanoTime() ^ sensorSeed ^ id.hashCode());
                bankCursor = next.pcm.length == 0 ? 0 : random.nextInt(next.pcm.length);
            } else {
                bankCursor = 0;
            }
            configureReverbBuffers(next.sampleRate);
        }
    }

    private void sensorBiasPosition() {
        synchronized (bankLock) {
            if (activeBank == null || activeBank.pcm.length == 0) return;
            long mixed = sensorSeed ^ ((long) (sensorActivity * 1_000_003f));
            Random local = new Random(mixed);
            if (local.nextFloat() < sensorMix) {
                bankCursor = local.nextInt(activeBank.pcm.length);
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

        long cursor;
        float bankSeconds;
        synchronized (bankLock) {
            cursor = gateOpenedAtCursor;
            bankSeconds = activeBank == null ? 0f : activeBank.durationSeconds();
        }

        SessionStore.SourceEvent event = new SessionStore.SourceEvent();
        event.offsetMs = Math.max(0, opened - sessionStartedAtMs);
        event.sourceId = String.format(
            Locale.US,
            "long-bank:%s@%.2fs/%.0fs",
            bankId,
            activeBank == null || activeBank.sampleRate == 0 ? 0.0 : cursor / (double) activeBank.sampleRate,
            bankSeconds
        );
        event.family = "wordless-human-bank";
        event.label = bankLabel + " gate window";
        event.effect = String.format(
            Locale.US,
            "manual-gate %.2fs / pre-rendered reversed+slowed+shuffled bank / reverb %.0f%%",
            duration / 1000.0,
            reverb * 100f
        );
        event.rate = 1f;
        event.volume = output;
        event.sensorInfluence = clamp01(sensorActivity * sensorMix);
        listener.onGateEvent(event);
    }

    private void configureReverbBuffers(int sampleRate) {
        int rate = Math.max(8000, sampleRate);
        delayA = new double[Math.max(1, Math.round(rate * 0.093f))];
        delayB = new double[Math.max(1, Math.round(rate * 0.157f))];
        delayAIndex = 0;
        delayBIndex = 0;
    }

    private double processReverb(double input) {
        double a = delayA[delayAIndex];
        double b = delayB[delayBIndex];

        double feedbackA = 0.25 + reverb * 0.32;
        double feedbackB = 0.20 + reverb * 0.28;

        delayA[delayAIndex] = input + a * feedbackA + b * 0.07;
        delayB[delayBIndex] = input * 0.70 + b * feedbackB + a * 0.05;

        delayAIndex++;
        if (delayAIndex >= delayA.length) delayAIndex = 0;
        delayBIndex++;
        if (delayBIndex >= delayB.length) delayBIndex = 0;

        return a * 0.58 + b * 0.42;
    }

    private static float clamp01(float value) {
        return Math.max(0f, Math.min(1f, value));
    }
}
