import 'dart:typed_data';
import 'dart:convert' show ascii; // no dart:io in this file (web-safe)

class AudioEngine {
  final int sampleRate = 16000;
  final int channels = 1;
  final int bytesPerSample = 2; // 16-bit PCM
  final int preRollSeconds = 10;

  late final int bufferSize;
  late final Uint8List ringBuffer;
  int writeIndex = 0;
  bool bufferFilled = false;

  AudioEngine() {
    bufferSize = sampleRate * channels * bytesPerSample * preRollSeconds;
    ringBuffer = Uint8List(bufferSize);
  }

  /// Feed little-endian 16-bit PCM chunks from the mic stream.
  void addPcmData(Uint8List pcmChunk) {
    final data = pcmChunk.length > bufferSize
        ? pcmChunk.sublist(pcmChunk.length - bufferSize)
        : pcmChunk;

    var remaining = data.length, offset = 0;
    while (remaining > 0) {
      final space = bufferSize - writeIndex;
      final toWrite = remaining < space ? remaining : space;
      ringBuffer.setRange(writeIndex, writeIndex + toWrite, data, offset);
      writeIndex = (writeIndex + toWrite) % bufferSize;
      if (writeIndex == 0) bufferFilled = true;
      offset += toWrite;
      remaining -= toWrite;
    }
  }

  Uint8List getPreRollData() {
    if (!bufferFilled) return ringBuffer.sublist(0, writeIndex);
    final ordered = Uint8List(bufferSize);
    final tail = bufferSize - writeIndex;
    ordered.setRange(0, tail, ringBuffer, writeIndex);
    ordered.setRange(tail, bufferSize, ringBuffer, 0);
    return ordered;
  }

  /// Returns full WAV bytes (pre-roll + live PCM).
  Future<Uint8List> buildWavBytesWithPreRoll(Uint8List livePcm) async {
    final pre = getPreRollData();
    final fullPcm = Uint8List(pre.length + livePcm.length)
      ..setAll(0, pre)
      ..setAll(pre.length, livePcm);
    return _pcmToWav(fullPcm, sampleRate, channels, bytesPerSample * 8);
  }

  Uint8List _pcmToWav(Uint8List pcm, int sr, int ch, int bitsPerSample) {
    final byteRate = sr * ch * (bitsPerSample ~/ 8);
    final blockAlign = ch * (bitsPerSample ~/ 8);
    final dataLength = pcm.length;
    final chunkSize = 36 + dataLength;

    final b = BytesBuilder();
    b.add(ascii.encode('RIFF'));
    b.add(_le(chunkSize, 4));
    b.add(ascii.encode('WAVE'));
    b.add(ascii.encode('fmt '));
    b.add(_le(16, 4));              // PCM subchunk
    b.add(_le(1, 2));               // audio format = PCM
    b.add(_le(ch, 2));
    b.add(_le(sr, 4));
    b.add(_le(byteRate, 4));
    b.add(_le(blockAlign, 2));
    b.add(_le(bitsPerSample, 2));
    b.add(ascii.encode('data'));
    b.add(_le(dataLength, 4));
    b.add(pcm);
    return b.toBytes();
  }

  Uint8List _le(int value, int bytes) {
    final out = Uint8List(bytes);
    for (var i = 0; i < bytes; i++) {
      out[i] = (value >> (8 * i)) & 0xFF;
    }
    return out;
  }
}
