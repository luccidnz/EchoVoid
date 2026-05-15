import { Audio } from 'expo-av';
import { RecordingOptionsPresets } from 'expo-av/build/Audio/RecordingConstants';

// Simple DSP chain: gain, FX placeholders
class LiveChain {
  private recording: Audio.Recording | null = null;
  private isActive = false;
  private gain = 1.0;
  private fx: string = 'Echo';
  private onLevel: ((n: number) => void) | null = null;
  private levelInterval: ReturnType<typeof setInterval> | null = null;

  async startLiveChain(opts: { onLevel?: (n: number) => void; gain?: number; fx?: string }) {
    if (this.isActive) return;
    this.isActive = true;
    this.gain = opts.gain ?? 1.0;
    this.fx = opts.fx ?? 'Echo';
    this.onLevel = opts.onLevel ?? null;
    console.time('LiveChain:start');
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      this.recording = new Audio.Recording();
      await this.recording.prepareToRecordAsync(RecordingOptionsPresets.HIGH_QUALITY);
      await this.recording.startAsync();
      // Simulate level monitoring (real: use Audio API or native module)
      this.levelInterval = setInterval(() => {
        if (!this.isActive || !this.onLevel) return;
        const mockLevel = Math.random() * this.gain;
        this.onLevel(mockLevel);
      }, 100);
    } catch (e) {
      console.error('LiveChain:start error', { error: e });
      this.isActive = false;
      throw e;
    } finally {
      console.timeEnd('LiveChain:start');
    }
  }

  async stopLiveChain() {
    console.time('LiveChain:stop');
    this.isActive = false;
    if (this.levelInterval) {
      clearInterval(this.levelInterval);
      this.levelInterval = null;
    }
    if (this.recording) {
      try {
        await this.recording.stopAndUnloadAsync();
      } catch {}
      this.recording = null;
    }
    console.timeEnd('LiveChain:stop');
  }

  setGain(g: number) {
    this.gain = g;
  }

  setFx(f: string) {
    this.fx = f;
  }

  setOnLevel(cb: (n: number) => void) {
    this.onLevel = cb;
  }
}

export default new LiveChain();

