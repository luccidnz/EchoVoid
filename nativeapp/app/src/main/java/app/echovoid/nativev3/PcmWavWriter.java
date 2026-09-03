package app.echovoid.nativev3;

import java.io.File;
import java.io.RandomAccessFile;

/** Writes little-endian mono 16-bit PCM WAV and patches the RIFF header on close. */
public final class PcmWavWriter implements AutoCloseable {
    private final RandomAccessFile file;
    private final int sampleRate;
    private long dataBytes;
    private boolean closed;

    public PcmWavWriter(File output, int sampleRate) throws Exception {
        this.sampleRate = sampleRate;
        File parent = output.getParentFile();
        if (parent != null && !parent.exists()) parent.mkdirs();
        file = new RandomAccessFile(output, "rw");
        file.setLength(0);
        writeHeader(0);
    }

    public synchronized void write(short[] pcm, int length) throws Exception {
        if (closed) return;
        int n = Math.max(0, Math.min(length, pcm.length));
        byte[] bytes = new byte[n * 2];
        int o = 0;
        for (int i = 0; i < n; i++) {
            short s = pcm[i];
            bytes[o++] = (byte) (s & 0xff);
            bytes[o++] = (byte) ((s >>> 8) & 0xff);
        }
        file.write(bytes);
        dataBytes += bytes.length;
    }

    @Override
    public synchronized void close() throws Exception {
        if (closed) return;
        closed = true;
        file.seek(0);
        writeHeader(dataBytes);
        file.close();
    }

    private void writeHeader(long dataLength) throws Exception {
        long riffSize = 36 + dataLength;
        file.writeBytes("RIFF");
        writeLe32(riffSize);
        file.writeBytes("WAVE");
        file.writeBytes("fmt ");
        writeLe32(16);
        writeLe16(1);
        writeLe16(1);
        writeLe32(sampleRate);
        writeLe32(sampleRate * 2L);
        writeLe16(2);
        writeLe16(16);
        file.writeBytes("data");
        writeLe32(dataLength);
    }

    private void writeLe16(long value) throws Exception {
        file.write((int) value & 0xff);
        file.write(((int) value >>> 8) & 0xff);
    }

    private void writeLe32(long value) throws Exception {
        file.write((int) value & 0xff);
        file.write(((int) value >>> 8) & 0xff);
        file.write(((int) value >>> 16) & 0xff);
        file.write(((int) value >>> 24) & 0xff);
    }
}
