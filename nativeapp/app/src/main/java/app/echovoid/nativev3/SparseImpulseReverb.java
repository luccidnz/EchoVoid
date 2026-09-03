package app.echovoid.nativev3;

import java.util.Arrays;

/**
 * Small deterministic FIR-style reverb built from sparse impulse taps.
 * The wet path has a finite tail and no feedback loop, so each profile behaves
 * like an impulse response rather than the old repeating delay network.
 */
public final class SparseImpulseReverb {
    public static final String[] PROFILES = new String[]{
        "Room",
        "Chamber",
        "Plate",
        "Hall",
        "Dark Hall",
        "Long Space",
        "Metallic",
        "Void"
    };

    private static final class Profile {
        final float[] delayMs;
        final float[] gain;
        final float damping;

        Profile(float[] delayMs, float[] gain, float damping) {
            this.delayMs = delayMs;
            this.gain = gain;
            this.damping = damping;
        }
    }

    private static final Profile[] DATA = new Profile[]{
        new Profile(
            new float[]{17, 29, 43, 61, 83, 109, 137, 173, 211},
            new float[]{.42f, .32f, .27f, .22f, .18f, .14f, .11f, .08f, .055f}, .16f),
        new Profile(
            new float[]{23, 41, 67, 97, 139, 191, 257, 337, 431, 557},
            new float[]{.40f, .34f, .29f, .24f, .20f, .16f, .125f, .09f, .065f, .045f}, .22f),
        new Profile(
            new float[]{11, 19, 31, 47, 71, 103, 151, 223, 317, 449, 617},
            new float[]{.36f, .34f, .31f, .28f, .23f, .19f, .15f, .115f, .082f, .057f, .039f}, .09f),
        new Profile(
            new float[]{37, 71, 113, 173, 251, 349, 467, 613, 797, 1019},
            new float[]{.36f, .31f, .27f, .23f, .19f, .15f, .115f, .085f, .059f, .039f}, .28f),
        new Profile(
            new float[]{41, 83, 139, 211, 307, 431, 587, 779, 1013, 1297},
            new float[]{.34f, .30f, .26f, .22f, .18f, .145f, .11f, .08f, .055f, .036f}, .48f),
        new Profile(
            new float[]{59, 127, 211, 331, 487, 683, 929, 1229, 1583, 1999},
            new float[]{.33f, .29f, .25f, .215f, .18f, .145f, .108f, .078f, .052f, .032f}, .34f),
        new Profile(
            new float[]{13, 27, 53, 89, 149, 233, 359, 521, 743, 997},
            new float[]{.38f, -.30f, .28f, -.22f, .19f, -.15f, .115f, -.082f, .056f, -.036f}, .12f),
        new Profile(
            new float[]{47, 101, 181, 293, 449, 661, 941, 1291, 1699, 2197},
            new float[]{.35f, .31f, .27f, .23f, .19f, .15f, .11f, .078f, .050f, .029f}, .40f)
    };

    private int sampleRate;
    private int profileIndex = 3;
    private boolean enabled = true;
    private float amount = .35f;
    private double[] ring = new double[1];
    private int cursor;
    private int[] delays = new int[0];
    private float[] gains = new float[0];
    private double dampState;

    public SparseImpulseReverb(int sampleRate) {
        setSampleRate(sampleRate);
    }

    public void setSampleRate(int sampleRate) {
        this.sampleRate = Math.max(8000, sampleRate);
        rebuild();
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setAmount(float amount) {
        this.amount = clamp01(amount);
    }

    public float getAmount() {
        return amount;
    }

    public void setProfile(String name) {
        int found = 0;
        for (int i = 0; i < PROFILES.length; i++) {
            if (PROFILES[i].equals(name)) {
                found = i;
                break;
            }
        }
        if (found != profileIndex) {
            profileIndex = found;
            rebuild();
        }
    }

    public String getProfile() {
        return PROFILES[profileIndex];
    }

    /** Returns wet-only signal. */
    public double process(double input) {
        ring[cursor] = input;
        if (!enabled || amount <= 0.0001f) {
            advance();
            return 0.0;
        }

        double wet = 0.0;
        for (int i = 0; i < delays.length; i++) {
            int read = cursor - delays[i];
            while (read < 0) read += ring.length;
            wet += ring[read] * gains[i];
        }

        Profile p = DATA[profileIndex];
        dampState += (wet - dampState) * (1.0 - p.damping * .82);
        double out = dampState;
        advance();
        return out;
    }

    public void clear() {
        Arrays.fill(ring, 0.0);
        cursor = 0;
        dampState = 0.0;
    }

    private void advance() {
        cursor++;
        if (cursor >= ring.length) cursor = 0;
    }

    private void rebuild() {
        Profile p = DATA[profileIndex];
        delays = new int[p.delayMs.length];
        gains = Arrays.copyOf(p.gain, p.gain.length);
        int maxDelay = 1;
        for (int i = 0; i < p.delayMs.length; i++) {
            delays[i] = Math.max(1, Math.round(p.delayMs[i] * sampleRate / 1000f));
            maxDelay = Math.max(maxDelay, delays[i]);
        }
        ring = new double[maxDelay + 2];
        cursor = 0;
        dampState = 0.0;
    }

    private static float clamp01(float v) {
        return Math.max(0f, Math.min(1f, v));
    }
}
