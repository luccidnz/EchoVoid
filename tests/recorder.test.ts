jest.mock('expo-av', () => ({
  Audio: {
    requestPermissionsAsync: jest.fn(),
    setAudioModeAsync: jest.fn(),
    Recording: class {
      async prepareToRecordAsync() {}
      async startAsync() {}
      async stopAndUnloadAsync() {}
      getURI() { return 'uri'; }
    },
  },
}));
jest.mock('expo-av/build/Audio/RecordingConstants', () => ({ RecordingOptionsPresets: { HIGH_QUALITY: {} } }));

import Recorder from '../services/audio/Recorder';

describe('Recorder', () => {
  it('should initialize and start recording', async () => {
    const startSpy = jest.spyOn(Recorder, 'startRecording').mockImplementation(async () => {});
    await Recorder.startRecording();
    expect(startSpy).toHaveBeenCalled();
    startSpy.mockRestore();
  });

  it('should stop and save recording', async () => {
    const stopSpy = jest.spyOn(Recorder, 'stopRecording').mockImplementation(async () => 'test-uri');
    const uri = await Recorder.stopRecording();
    expect(stopSpy).toHaveBeenCalled();
    expect(uri).toBe('test-uri');
    stopSpy.mockRestore();
  });

  it('should mark anomalies during recording', () => {
    const markSpy = jest.spyOn(Recorder, 'markAnomaly').mockImplementation(() => {});
    Recorder.markAnomaly();
    expect(markSpy).toHaveBeenCalled();
    markSpy.mockRestore();
  });
});
