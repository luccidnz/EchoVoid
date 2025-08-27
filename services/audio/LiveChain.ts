
import { Audio } from 'expo-av';
import { RecordingOptionsPresets } from 'expo-av/build/Audio/RecordingConstants';
// Simple DSP chain: gain, FX placeholders
let recording: Audio.Recording | null = null;
let isActive = false;
let gain = 1.0;
let fx: string = 'Echo';
let onLevel: ((n: number) => void) | null = null;


	export async function startLiveChain(opts: { onLevel?: (n: number) => void; gain?: number; fx?: string }) {
		if (isActive) return;
		isActive = true;
		gain = opts.gain ?? 1.0;
		fx = opts.fx ?? 'Echo';
		onLevel = opts.onLevel ?? null;
		console.time('LiveChain:start');
		try {
			await Audio.requestPermissionsAsync();
			await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
			recording = new Audio.Recording();
			await recording.prepareToRecordAsync(RecordingOptionsPresets.HIGH_QUALITY);
			await recording.startAsync();
			// Simulate level monitoring (real: use Audio API or native module)
			const levelInterval = setInterval(() => {
				if (!isActive || !onLevel) return;
				const mockLevel = Math.random() * gain;
				onLevel(mockLevel);
			}, 100);
			(recording as any)._levelInterval = levelInterval;
		} catch (e) {
			// handle error
		}
		console.timeEnd('LiveChain:start');
	}

	export async function stopLiveChain() {
		console.time('LiveChain:stop');
		isActive = false;
		if (recording) {
			try {
				await recording.stopAndUnloadAsync();
			} catch {}
			if ((recording as any)._levelInterval) clearInterval((recording as any)._levelInterval);
			recording = null;
		}
		console.timeEnd('LiveChain:stop');
	}

export function setGain(g: number) { gain = g; }
export function setFx(f: string) { fx = f; }
export function setOnLevel(cb: (n: number) => void) { onLevel = cb; }

export default { startLiveChain, stopLiveChain, setGain, setFx, setOnLevel };
