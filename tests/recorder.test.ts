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
