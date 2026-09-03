package app.echovoid.nativev3;

import android.content.Context;
import android.media.AudioAttributes;
import android.media.AudioFormat;
import android.media.AudioTrack;

import java.io.File;
import java.util.Locale;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * Ech0Gate HSB-style core.
 *
 * A finished wordless bank advances continuously whether audible or not. The user
 * controls the only exposure gate. Opening the gate never selects a fragment,
 * resets the playhead, reads sensors, or triggers autonomous audio.
 */
public final class WordlessGateEngine {
    public interface Listener {
        void onGateEvent(SessionStore.SourceEvent event);
        void onEngineError(String message);
    }

    private static final int FRAME = 512;
    private static final float OPEN_THRESHOLD = 0.01f;

    private final Context context;
    private final AudioBank bank;
    private final Listener listener;
    private final AtomicBoolean running = new AtomicBoolean(false);
    private final Object bankLock = new Object();

    private AudioTrack track;
    private Thread worker;
    private AudioBank.LongBank activeBank;
    private SparseImpulseReverb reverb;
    private PcmWavWriter captureWriter;
    private File captureFile;

    private volatile float gateTarget;
    private volatile float gateCurrent;
    private volatile float output = 0.74f;
    private volatile float reverbAmount = 0.28f;
    private volatile boolean reverbEnabled = true;
    private volatile float fineTuneSemitones;
    private volatile String reverbProfile = "Hall";
    private volatile String bankId = "middle_female_a";
    private volatile String bankLabel = "Middle Female A";
    private volatile float outputRms;

    private double bankCursor;
    private long sessionStartedAtMs;
    private long gateOpenedAtMs;
    private double gateOpenedAtCursor;
    private double gateAccum;
    private long gateStatSamples;
    private float gateMax;

    public WordlessGateEngine(Context context, Listener listener) throws Exception {
        this.context = context.getApplicationContext();
        this.bank = new AudioBank(context);
        this.listener = listener;
        loadBank("middle_female_a");
    }

    public String[] bankIds() { return bank.realBankIds(); }
    public String bankLabel(String id) { return bank.realBankLabel(id); }
    public String getBankId() { return bankId; }
    public String getBankLabel() { return bankLabel; }

    public boolean isRunning() { return running.get(); }
    public boolean isGateOpen() { return gateTarget >= OPEN_THRESHOLD; }
    public float getGate() { return gateTarget; }
    public float getOutputRms() { return outputRms; }

    public long getGateOpenDurationMs() {
        long opened = gateOpenedAtMs;
        return opened <= 0 ? 0 : Math.max(0, System.currentTimeMillis() - opened);
    }

    public double getBankPositionSeconds() {
        synchronized (bankLock) {
            if (activeBank == null || activeBank.sampleRate <= 0) return 0.0;
            return bankCursor / activeBank.sampleRate;
        }
    }

    public double getBankDurationSeconds() {
        synchronized (bankLock) {
            return activeBank == null ? 0.0 : activeBank.durationSeconds();
        }
    }

    public void setBank(String id) throws Exception {
        if (id == null || id.equals(bankId)) return;
        if (isGateOpen()) throw new IllegalStateException("Close the noise gate before changing voice bank.");
        loadBank(id);
    }

    public void setCaptureFile(File captureFile) {
        this.captureFile = captureFile;
    }

    public void setGate(float amount) {
        float next = clamp01(amount);
        float previous = gateTarget;
        gateTarget = next;

        boolean opening = previous < OPEN_THRESHOLD && next >= OPEN_THRESHOLD;
        boolean closing = previous >= OPEN_THRESHOLD && next < OPEN_THRESHOLD;
        if (opening) beginGateWindow();
        else if (closing) emitGateWindow();
    }

    public void setOutput(float value) { output = clamp01(value); }

    public void setFineTuneSemitones(float semitones) {
        fineTuneSemitones = Math.max(-6f, Math.min(6f, semitones));
    }

    public float getFineTuneSemitones() { return fineTuneSemitones; }

    public void setReverbEnabled(boolean enabled) {
        reverbEnabled = enabled;
        if (reverb != null) reverb.setEnabled(enabled);
    }

    public boolean isReverbEnabled() { return reverbEnabled; }

    public void setReverbAmount(float value) {
        reverbAmount = clamp01(value);
        if (reverb != null) reverb.setAmount(reverbAmount);
    }

    public float getReverbAmount() { return reverbAmount; }

    public void setReverbProfile(String profile) {
        reverbProfile = profile == null ? "Hall" : profile;
        if (reverb != null) reverb.setProfile(reverbProfile);
    }

    public String getReverbProfile() { return reverbProfile; }

    public void start() {
        if (activeBank == null || activeBank.pcm.length == 0) {
            error("Wordless voice bank is unavailable.");
            return;
        }
        if (!running.compareAndSet(false, true)) return;

        sessionStartedAtMs = System.currentTimeMillis();
        gateTarget = 0f;
        gateCurrent = 0f;
        gateOpenedAtMs = 0;
        outputRms = 0f;

        int sampleRate = activeBank.sampleRate;
        reverb = new SparseImpulseReverb(sampleRate);
        reverb.setProfile(reverbProfile);
        reverb.setAmount(reverbAmount);
        reverb.setEnabled(reverbEnabled);

        if (captureFile != null) {
            try {
                captureWriter = new PcmWavWriter(captureFile, sampleRate);
            } catch (Exception e) {
                captureWriter = null;
                error("Internal gate recording unavailable: " + e.getMessage());
            }
        }

        int minBuffer = AudioTrack.getMinBufferSize(
            sampleRate,
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
                    .setSampleRate(sampleRate)
                    .setEncoding(AudioFormat.ENCODING_PCM_16BIT)
                    .setChannelMask(AudioFormat.CHANNEL_OUT_MONO)
                    .build())
                .setTransferMode(AudioTrack.MODE_STREAM)
                .setBufferSizeInBytes(bufferSize)
                .build();
            track.play();
        } catch (Exception e) {
            running.set(false);
            closeWriter();
            error("Gate audio output failed: " + e.getMessage());
            return;
        }

        worker = new Thread(this::renderLoop, "Ech0VoidManualNoiseGate");
        worker.setPriority(Thread.MAX_PRIORITY);
        worker.start();
    }

    public void stop() {
        if (gateTarget >= OPEN_THRESHOLD) {
            gateTarget = 0f;
            emitGateWindow();
        }
        running.set(false);
        if (worker != null) {
            try { worker.join(1200); } catch (InterruptedException ignored) {}
            worker = null;
        }
        if (track != null) {
            try { track.pause(); } catch (Exception ignored) {}
            try { track.flush(); } catch (Exception ignored) {}
            try { track.stop(); } catch (Exception ignored) {}
            try { track.release(); } catch (Exception ignored) {}
            track = null;
        }
        closeWriter();
    }

    private void renderLoop() {
        short[] pcm = new short[FRAME];

        while (running.get()) {
            try {
                double blockEnergy = 0.0;
                float playbackStep = (float) Math.pow(2.0, fineTuneSemitones / 12.0);

                for (int i = 0; i < FRAME; i++) {
                    double raw = readBankSample(playbackStep);

                    // Very fast smoothing only prevents zipper/click artefacts. The slider
                    // itself remains the continuous authority over audible gain.
                    gateCurrent += (gateTarget - gateCurrent) * 0.16f;
                    double dry = raw * gateCurrent;
                    double wet = reverb == null ? 0.0 : reverb.process(dry);
                    double mix = dry + wet * reverbAmount * (reverbEnabled ? 0.68 : 0.0);
                    mix *= output;
                    mix = Math.max(-1.0, Math.min(1.0, mix));

                    if (gateOpenedAtMs > 0) {
                        gateAccum += gateCurrent;
                        gateStatSamples++;
                        gateMax = Math.max(gateMax, gateCurrent);
                    }

                    blockEnergy += mix * mix;
                    pcm[i] = (short) Math.round(mix * 32767.0);
                }

                outputRms = (float) Math.sqrt(blockEnergy / FRAME);

                if (track != null) {
                    int wrote = track.write(pcm, 0, pcm.length, AudioTrack.WRITE_BLOCKING);
                    if (wrote < 0) throw new IllegalStateException("Audio write error " + wrote);
                }
                if (captureWriter != null) captureWriter.write(pcm, pcm.length);
            } catch (Throwable t) {
                running.set(false);
                error("Manual gate stopped: " + t.getMessage());
            }
        }
    }

    private double readBankSample(float playbackStep) {
        synchronized (bankLock) {
            if (activeBank == null || activeBank.pcm.length == 0) return 0.0;
            int length = activeBank.pcm.length;
            int i0 = (int) bankCursor;
            int i1 = i0 + 1;
            if (i1 >= length) i1 = 0;
            double frac = bankCursor - i0;
            double a = activeBank.pcm[i0] / 32768.0;
            double b = activeBank.pcm[i1] / 32768.0;
            double value = a + (b - a) * frac;

            // Crucial HSB-style behaviour: the playhead advances regardless of gate level.
            bankCursor += playbackStep;
            while (bankCursor >= length) bankCursor -= length;
            return value;
        }
    }

    private void loadBank(String id) throws Exception {
        AudioBank.LongBank next = bank.loadRealBank(context, id);
        synchronized (bankLock) {
            activeBank = next;
            bankId = next.id;
            bankLabel = next.label;
            bankCursor = 0.0;
            if (reverb != null) reverb.setSampleRate(next.sampleRate);
        }
    }

    private void beginGateWindow() {
        gateOpenedAtMs = System.currentTimeMillis();
        synchronized (bankLock) {
            gateOpenedAtCursor = bankCursor;
        }
        gateAccum = 0.0;
        gateStatSamples = 0;
        gateMax = 0f;
    }

    private void emitGateWindow() {
        long opened = gateOpenedAtMs;
        if (opened <= 0) return;
        long now = System.currentTimeMillis();
        long duration = Math.max(1, now - opened);
        gateOpenedAtMs = 0;

        if (listener == null) return;

        double startCursor;
        double endCursor;
        float bankSeconds;
        int sampleRate;
        synchronized (bankLock) {
            startCursor = gateOpenedAtCursor;
            endCursor = bankCursor;
            bankSeconds = activeBank == null ? 0f : activeBank.durationSeconds();
            sampleRate = activeBank == null ? 1 : activeBank.sampleRate;
        }

        float avgGate = gateStatSamples <= 0 ? 0f : (float) (gateAccum / gateStatSamples);
        float step = (float) Math.pow(2.0, fineTuneSemitones / 12.0);

        SessionStore.SourceEvent event = new SessionStore.SourceEvent();
        event.offsetMs = Math.max(0, opened - sessionStartedAtMs);
        event.sourceId = String.format(
            Locale.US,
            "bank:%s@%.2fs->%.2fs/%.0fs",
            bankId,
            startCursor / sampleRate,
            endCursor / sampleRate,
            bankSeconds
        );
        event.family = "wordless-human-bank";
        event.label = bankLabel + " noise-gate exposure";
        event.effect = String.format(
            Locale.US,
            "manual %.2fs / avg gate %.0f%% / max %.0f%% / fine %+1.1f st / reverb %s %s %.0f%%",
            duration / 1000.0,
            avgGate * 100f,
            gateMax * 100f,
            fineTuneSemitones,
            reverbEnabled ? "ON" : "OFF",
            reverbProfile,
            reverbAmount * 100f
        );
        event.rate = step;
        event.volume = avgGate * output;
        event.sensorInfluence = 0f;
        listener.onGateEvent(event);
    }

    private void closeWriter() {
        if (captureWriter == null) return;
        try { captureWriter.close(); } catch (Exception ignored) {}
        captureWriter = null;
    }

    private void error(String message) {
        if (listener != null) listener.onEngineError(message);
    }

    private static float clamp01(float value) {
        return Math.max(0f, Math.min(1f, value));
    }
}
