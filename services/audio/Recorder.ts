
import { Audio } from 'expo-av';
import { RecordingOptionsPresets } from 'expo-av/build/Audio/RecordingConstants';
let recording: Audio.Recording | null = null;
let markers: number[] = [];
let startTime: number | null = null;

export async function startRecording() {
        if (recording) return;
        try {
                const { status } = await Audio.requestPermissionsAsync();
                if (status !== 'granted') {
                        throw new Error('Recording permission denied');
                }
                await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
                const newRecording = new Audio.Recording();
                await newRecording.prepareToRecordAsync(RecordingOptionsPresets.HIGH_QUALITY);
                await newRecording.startAsync();
                recording = newRecording;
                markers = [];
                startTime = Date.now();
        } catch (err: any) {
                recording = null;
                throw err instanceof Error ? err : new Error('Failed to start recording');
        }
}

export async function stopRecording() {
	if (!recording) return null;
	try {
		await recording.stopAndUnloadAsync();
		const uri = recording.getURI();
		recording = null;
		startTime = null;
		return uri;
	} catch {
		return null;
	}
}

export function markAnomaly() {
	if (!startTime) return;
	markers.push(Date.now() - startTime);
}

export function getMarkers() {
        return markers;
}

export function isRecording() {
        return !!recording;
}

export default { startRecording, stopRecording, markAnomaly, getMarkers, isRecording };
