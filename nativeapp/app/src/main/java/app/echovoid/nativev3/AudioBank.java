package app.echovoid.nativev3;

import android.content.Context;
import android.content.res.Resources;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

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

        public int startMs() {
            return Math.round(start * 1000f / source.sampleRate);
        }

        public int lengthMs() {
            return Math.round(length * 1000f / source.sampleRate);
        }
    }

    private final List<Source> sources = new ArrayList<>();
    private final Random random = new Random();

    public AudioBank(Context context) throws Exception {
        Resources r = context.getResources();

        sources.add(load(r, R.raw.vox_01, "vox01", "Vox 01 • Clear"));
        sources.add(load(r, R.raw.vox_02, "vox02", "Vox 02 • Low"));
        sources.add(load(r, R.raw.vox_03, "vox03", "Vox 03 • Bright"));
        sources.add(load(r, R.raw.vox_04, "vox04", "Vox 04 • Dry"));
        sources.add(load(r, R.raw.vox_05, "vox05", "Vox 05 • Hollow"));
        sources.add(load(r, R.raw.vox_06, "vox06", "Vox 06 • Grain"));
        sources.add(load(r, R.raw.vox_07, "vox07", "Vox 07 • Airy"));
        sources.add(load(r, R.raw.vox_08, "vox08", "Vox 08 • Dark"));
        sources.add(load(r, R.raw.vox_09, "vox09", "Vox 09 • Neutral"));
        sources.add(load(r, R.raw.vox_10, "vox10", "Vox 10 • Narrow"));
        sources.add(load(r, R.raw.vox_11, "vox11", "Vox 11 • Soft"));
        sources.add(load(r, R.raw.vox_12, "vox12", "Vox 12 • Rough"));
        sources.add(load(r, R.raw.voice_metro, "radio", "Radio / Announcement"));
    }

    public boolean isReady() {
        return !sources.isEmpty();
    }

    public String[] bankIds() {
        return new String[]{
            "voidmix",
            "vox01", "vox02", "vox03", "vox04",
            "vox05", "vox06", "vox07", "vox08",
            "vox09", "vox10", "vox11", "vox12",
            "radio"
        };
    }

    public String bankLabel(String bankId) {
        if ("voidmix".equals(bankId)) return "VOID MIX • 12 voices";
        for (Source source : sources) {
            if (source.id.equals(bankId)) return source.label;
        }
        return "VOID MIX • 12 voices";
    }

    public List<Source> sourcesForBank(String bankId) {
        List<Source> result = new ArrayList<>();

        if ("voidmix".equals(bankId)) {
            for (Source source : sources) {
                if (!"radio".equals(source.id)) result.add(source);
            }
            return result;
        }

        for (Source source : sources) {
            if (source.id.equals(bankId)) {
                result.add(source);
                return result;
            }
        }

        for (Source source : sources) {
            if (!"radio".equals(source.id)) result.add(source);
        }
        return result;
    }

    public FragmentSpec pick(
        long seed,
        int minMs,
        int maxMs,
        float minRate,
        float maxRate,
        boolean allowReverse,
        float gain
    ) {
        if (sources.isEmpty()) return null;
        random.setSeed(seed);

        Source source = sources.get(random.nextInt(sources.size()));
        int lengthMs = minMs + random.nextInt(Math.max(1, maxMs - minMs + 1));
        int length = Math.max(24, Math.round(lengthMs * source.sampleRate / 1000f));
        length = Math.min(length, Math.max(24, source.pcm.length - 1));

        int start = chooseEnergeticStart(source, length, random);
        float rate = minRate + random.nextFloat() * Math.max(0.01f, maxRate - minRate);
        boolean reverse = allowReverse && random.nextBoolean();

        return new FragmentSpec(source, start, length, rate, reverse, gain);
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

    private static int chooseEnergeticStart(Source source, int length, Random random) {
        int maxStart = Math.max(0, source.pcm.length - length - 1);
        if (maxStart <= 0) return 0;

        int bestStart = random.nextInt(maxStart + 1);
        double bestEnergy = -1;
        int attempts = 18;

        for (int a = 0; a < attempts; a++) {
            int candidate = random.nextInt(maxStart + 1);
            int stride = Math.max(1, length / 32);
            double sum = 0;
            int count = 0;
            for (int i = candidate; i < candidate + length; i += stride) {
                sum += Math.abs((int) source.pcm[i]);
                count++;
            }
            double energy = count == 0 ? 0 : sum / count;
            if (energy > bestEnergy) {
                bestEnergy = energy;
                bestStart = candidate;
            }
        }
        return bestStart;
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
