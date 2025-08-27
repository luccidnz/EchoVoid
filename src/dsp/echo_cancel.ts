/**
 * Simple time domain echo cancellation.
 * The algorithm subtracts a delayed and attenuated version of the signal
 * from itself. This is a naive implementation intended for demonstration.
 */
export async function applyEchoCancellation(blob: Blob): Promise<Blob> {
  const arrayBuffer = await blob.arrayBuffer();
  const audioCtx = new AudioContext();
  const buffer = await audioCtx.decodeAudioData(arrayBuffer);
  const out = audioCtx.createBuffer(
    buffer.numberOfChannels,
    buffer.length,
    buffer.sampleRate
  );

  const delaySamples = Math.floor(0.2 * buffer.sampleRate); // 200ms delay
  const attenuation = 0.6;

  for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
    const input = buffer.getChannelData(ch);
    const output = out.getChannelData(ch);
    for (let i = 0; i < input.length; i++) {
      const delayed = i >= delaySamples ? input[i - delaySamples] * attenuation : 0;
      output[i] = input[i] - delayed;
    }
  }

  const processed = await encodeWav(out);
  return new Blob([processed], { type: 'audio/wav' });
}

/** Encode an AudioBuffer to a WAV ArrayBuffer. */
async function encodeWav(buffer: AudioBuffer): Promise<ArrayBuffer> {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitsPerSample = 16;
  const numFrames = buffer.length;
  const blockAlign = numChannels * bitsPerSample / 8;
  const byteRate = sampleRate * blockAlign;
  const dataSize = numFrames * blockAlign;
  const bufferSize = 44 + dataSize;
  const arrayBuffer = new ArrayBuffer(bufferSize);
  const view = new DataView(arrayBuffer);

  let offset = 0;
  function writeString(s: string) {
    for (let i = 0; i < s.length; i++) {
      view.setUint8(offset++, s.charCodeAt(i));
    }
  }
  function writeUint32(v: number) {
    view.setUint32(offset, v, true);
    offset += 4;
  }
  function writeUint16(v: number) {
    view.setUint16(offset, v, true);
    offset += 2;
  }

  writeString('RIFF');
  writeUint32(bufferSize - 8);
  writeString('WAVE');
  writeString('fmt ');
  writeUint32(16);
  writeUint16(format);
  writeUint16(numChannels);
  writeUint32(sampleRate);
  writeUint32(byteRate);
  writeUint16(blockAlign);
  writeUint16(bitsPerSample);
  writeString('data');
  writeUint32(dataSize);

  const temp = new Float32Array(numFrames * numChannels);
  for (let ch = 0; ch < numChannels; ch++) {
    temp.set(buffer.getChannelData(ch), ch);
  }
  const s16 = new DataView(arrayBuffer, 44);
  for (let i = 0; i < temp.length; i++) {
    const sample = Math.max(-1, Math.min(1, temp[i]));
    s16.setInt16(i * 2, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
  }
  return arrayBuffer;
}
