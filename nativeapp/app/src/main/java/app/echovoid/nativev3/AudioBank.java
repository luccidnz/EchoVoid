package app.echovoid.nativev3;

import android.content.Context;
import android.content.res.Resources;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;

/** Loads finished wordless banks. Ech0Gate never chops speech at runtime. */
public final class AudioBank {
    public static final class Source {
        public final String id;
        public final String label;
        public final short[] pcm;
        public final int sampleRate;

        Source(String id, String label, short[] pcm, int sampleRate) {
            this.id = id;
            this.label = label;
            this.pcm = pcm;
            this.sampleRate = sampleRate;
        }
    }

    /** Compatibility shape retained only so the disabled legacy engine still compiles. */
    public static final class FragmentSpec {
        public final Source source;
        public final int start;
        public final int length;
        public final float rate;
        public final boolean reverse;
        public final float gain;

        FragmentSpec(Source source, int start, int length, float rate, boolean reverse, float gain) {
            this.source = source;
            this.start = start;
            this.length = length;
            this.rate = rate;
            this.reverse = reverse;
            this.gain = gain;
        }

        public int startMs() { return Math.round(start * 1000f / source.sampleRate); }
        public int lengthMs() { return Math.round(length * 1000f / source.sampleRate); }
    }

    public static final class LongBank {
        public final String id;
        public final String label;
        public final short[] pcm;
        public final int sampleRate;

        LongBank(String id, String label, short[] pcm, int sampleRate) {
            this.id = id;
            this.label = label;
            this.pcm = pcm;
            this.sampleRate = sampleRate;
        }

        public float durationSeconds() {
            return pcm.length / (float) sampleRate;
        }
    }

    private final Context context;

    public AudioBank(Context context) {
        this.context = context.getApplicationContext();
    }

    public boolean isReady() { return true; }

    public String[] realBankIds() {
        return new String[]{
            "middle_female_a",
            "female_b",
            "female_c",
            "male_a",
            "male_b",
            "older_male_a",
            "voice_a",
            "mixed"
        };
    }

    public String realBankLabel(String id) {
        if ("middle_female_a".equals(id)) return "Middle Female A";
        if ("female_b".equals(id)) return "Female Voice B";
        if ("female_c".equals(id)) return "Female Voice C";
        if ("male_a".equals(id)) return "Male Voice A";
        if ("male_b".equals(id)) return "Male Voice B";
        if ("older_male_a".equals(id)) return "Older Male A";
        if ("voice_a".equals(id)) return "Voice A";
        return "Mixed Human";
    }

    public LongBank loadRealBank(Context ignored, String id) throws Exception {
        Resources r = context.getResources();
        int resId;
        if ("middle_female_a".equals(id)) resId = R.raw.bank_middle_female_a;
        else if ("female_b".equals(id)) resId = R.raw.bank_female_b;
        else if ("female_c".equals(id)) resId = R.raw.bank_female_c;
        else if ("male_a".equals(id)) resId = R.raw.bank_male_a;
        else if ("male_b".equals(id)) resId = R.raw.bank_male_b;
        else if ("older_male_a".equals(id)) resId = R.raw.bank_older_male_a;
        else if ("voice_a".equals(id)) resId = R.raw.bank_voice_a;
        else resId = R.raw.bank_mixed;

        Source source = load(r, resId, id, realBankLabel(id));
        return new LongBank(id, realBankLabel(id), source.pcm, source.sampleRate);
    }

    /** Disabled legacy engines may call this; returning null prevents old pseudo-bank behaviour. */
    public FragmentSpec pick(long seed, int minMs, int maxMs, float minRate, float maxRate,
                             boolean allowReverse, float gain) {
        return null;
    }

    private static Source load(Resources resources, int id, String sourceId, String label) throws Exception {
        try (InputStream in = resources.openRawResource(id)) {
            byte[] wav = readAll(in);
            WavData parsed = parseWav(wav);
            if (parsed.bitsPerSample != 16 || parsed.channels != 1) {
                throw new IllegalStateException(label + " must be mono signed 16-bit PCM");
            }

            int samples = parsed.dataLength / 2;
            short[] pcm = new short[samples];
            int src = parsed.dataOffset;
            for (int i = 0; i < samples; i++, src += 2) {
                int lo = wav[src] & 0xff;
                int hi = wav[src + 1];
                pcm[i] = (short) (lo | (hi << 8));
            }
            return new Source(sourceId, label, pcm, parsed.sampleRate);
        }
    }

    private static final class WavData {
        int channels;
        int sampleRate;
        int bitsPerSample;
        int dataOffset;
        int dataLength;
    }

    private static WavData parseWav(byte[] bytes) {
        if (bytes.length < 44 || !ascii(bytes, 0, 4).equals("RIFF") || !ascii(bytes, 8, 4).equals("WAVE")) {
            throw new IllegalArgumentException("Invalid WAV source");
        }
        WavData out = new WavData();
        int offset = 12;
        while (offset + 8 <= bytes.length) {
            String chunk = ascii(bytes, offset, 4);
            int length = littleInt(bytes, offset + 4);
            int data = offset + 8;
            if (data + length > bytes.length) break;
            if ("fmt ".equals(chunk) && length >= 16) {
                int format = littleShort(bytes, data);
                if (format != 1) throw new IllegalArgumentException("Only PCM WAV supported");
                out.channels = littleShort(bytes, data + 2);
                out.sampleRate = littleInt(bytes, data + 4);
                out.bitsPerSample = littleShort(bytes, data + 14);
            } else if ("data".equals(chunk)) {
                out.dataOffset = data;
                out.dataLength = length;
                break;
            }
            offset = data + length + (length & 1);
        }
        if (out.dataOffset <= 0 || out.dataLength <= 0 || out.sampleRate <= 0) {
            throw new IllegalArgumentException("WAV is missing required chunks");
        }
        return out;
    }

    private static byte[] readAll(InputStream in) throws Exception {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        byte[] buffer = new byte[8192];
        int n;
        while ((n = in.read(buffer)) >= 0) out.write(buffer, 0, n);
        return out.toByteArray();
    }

    private static String ascii(byte[] b, int offset, int length) {
        StringBuilder s = new StringBuilder(length);
        for (int i = 0; i < length; i++) s.append((char) b[offset + i]);
        return s.toString();
    }

    private static int littleShort(byte[] b, int offset) {
        return (b[offset] & 0xff) | ((b[offset + 1] & 0xff) << 8);
    }

    private static int littleInt(byte[] b, int offset) {
        return (b[offset] & 0xff)
            | ((b[offset + 1] & 0xff) << 8)
            | ((b[offset + 2] & 0xff) << 16)
            | ((b[offset + 3] & 0xff) << 24);
    }
}
