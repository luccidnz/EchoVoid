
import { Audio } from 'expo-av';
import { RecordingOptionsPresets } from 'expo-av/build/Audio/RecordingConstants';
let recording: Audio.Recording | null = null;
let markers: number[] = [];
let startTime: number | null = null;

export async function startRecording() {
        if (recording) return;
        const { granted } = await Audio.requestPermissionsAsync();
        if (!granted) return;
        await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
        recording = new Audio.Recording();
        await recording.prepareToRecordAsync(RecordingOptionsPresets.HIGH_QUALITY);
        await recording.startAsync();
        markers = [];
        startTime = Date.now();
}

export async function stopRecording() {
        if (!recording) return null;
        let uri: string | null = null;
        try {
                await recording.stopAndUnloadAsync();
                uri = recording.getURI();
        } catch {
                uri = null;
        } finally {
                recording = null;
                startTime = null;
        }
        return uri;
}

export function markAnomaly() {
	if (!startTime) return;
	markers.push(Date.now() - startTime);
}

export function getMarkers() {
	return markers;
}

export default { startRecording, stopRecording, markAnomaly, getMarkers };
