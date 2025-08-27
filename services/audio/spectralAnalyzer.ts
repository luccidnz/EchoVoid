import { Audio } from 'expo-av';

// Very small FFT implementation (naive DFT) to avoid external deps
function dft(buffer: Float32Array): number[] {
  const n = buffer.length;
  const result: number[] = new Array(Math.floor(n / 2));
  for (let k = 0; k < result.length; k++) {
    let re = 0;
    let im = 0;
    for (let i = 0; i < n; i++) {
      const angle = (2 * Math.PI * k * i) / n;
      re += buffer[i] * Math.cos(angle);
      im -= buffer[i] * Math.sin(angle);
    }
    result[k] = Math.sqrt(re * re + im * im) / n;
  }
  return result;
}

export type SpectrumCallback = (bins: number[]) => void;

let recording: Audio.Recording | null = null;
let running = false;
let fftSize = 256;
let onSpectrum: SpectrumCallback | null = null;

export async function start(opts: { fftSize?: number; onSpectrum: SpectrumCallback }) {
  if (running) return;
  fftSize = opts.fftSize ?? 256;
  onSpectrum = opts.onSpectrum;
  running = true;
  await Audio.requestPermissionsAsync();
  await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
  recording = new Audio.Recording();
  await recording.prepareToRecordAsync({
    android: {
      extension: '.wav',
      outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_PCM_16BIT,
      audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_PCM_16BIT,
      sampleRate: 44100,
      numberOfChannels: 1,
      bitRate: 128000,
    },
    ios: {
      extension: '.caf',
      outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_LINEARPCM,
      audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_MIN,
      sampleRate: 44100,
      numberOfChannels: 1,
      linearPCMBitDepth: 16,
      linearPCMIsBigEndian: false,
      linearPCMIsFloat: false,
    },
    web: {
      mimeType: 'audio/webm',
      bitsPerSecond: 128000,
    },
    isMeteringEnabled: true,
  });

  // @ts-ignore Expo SDK provides this for getting PCM data
  (recording as any).setOnRecordingStatusUpdate?.((status: any) => {
    const pcm = status?.samples as Float32Array | undefined;
    if (!pcm || pcm.length < fftSize) return;
    const slice = pcm.slice(0, fftSize);
    const spectrum = dft(slice);
    const max = Math.max(...spectrum) || 1;
    onSpectrum?.(spectrum.map((v) => v / max));
  });

  await recording.startAsync();
}

export async function stop() {
  running = false;
  onSpectrum = null;
  if (recording) {
    try {
      // @ts-ignore clear callback if available
      recording.setOnRecordingStatusUpdate?.(null);
      await recording.stopAndUnloadAsync();
    } catch {}
    recording = null;
  }
}

export default { start, stop };
