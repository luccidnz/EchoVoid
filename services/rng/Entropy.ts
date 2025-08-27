import { Accelerometer } from 'expo-sensors';
import { Audio } from 'expo-av';

export default async function getEntropy() {
  let micRMS = 0;
  let accelData = { x: 0, y: 0, z: 0 };

  try {
    // Get microphone RMS
    const { granted } = await Audio.requestPermissionsAsync();
    if (granted) {
      const recording = new Audio.Recording();
      const recordingOptions = {
        android: {
          extension: '.m4a',
          outputFormat: 2, // Default MPEG_4
          audioEncoder: 3, // Default AAC
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: '.caf',
          audioQuality: 127, // Maximum quality
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/webm',
          bitsPerSecond: 128000,
        },
      };
      await recording.prepareToRecordAsync(recordingOptions);
      await recording.startAsync();
      try {
        const status = await recording.getStatusAsync();
        micRMS = status.metering || 0;
      } finally {
        await recording.stopAndUnloadAsync();
      }
    }

    // Get accelerometer data
    const { granted: accelGranted } = await Accelerometer.requestPermissionsAsync();
    if (accelGranted) {
      const accelListener = Accelerometer.addListener((data) => {
        accelData = data;
      });
      try {
        await new Promise((resolve) => setTimeout(resolve, 100)); // Wait for data
      } finally {
        accelListener.remove();
      }
    }
  } catch (error) {
    console.error('Failed to gather entropy sources:', error);
  }

  // Combine entropy sources
  const combined = (Math.abs(accelData.x) + Math.abs(accelData.y) + Math.abs(accelData.z) + micRMS + Math.random()) % 1;
  return combined;
}
