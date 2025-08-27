import { applyEchoCancellation } from '../dsp/echo_cancel';

/**
 * RecorderService handles microphone input and saves audio files.
 * This implementation uses the MediaRecorder API available in modern browsers.
 * Recorded audio is processed with a simple echo cancellation algorithm
 * before being returned to the caller.
 */
export class RecorderService {
  private mediaRecorder?: MediaRecorder;
  private chunks: BlobPart[] = [];

  /** Start capturing audio from the microphone. */
  async start(): Promise<void> {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.mediaRecorder = new MediaRecorder(stream);
    this.chunks = [];
    this.mediaRecorder.ondataavailable = (e: BlobEvent) => {
      if (e.data.size > 0) this.chunks.push(e.data);
    };
    this.mediaRecorder.start();
  }

  /**
   * Stop recording and return a processed audio Blob.
   * @param filename Optional filename used when triggering a download.
   */
  async stop(filename = 'recording.webm'): Promise<Blob> {
    if (!this.mediaRecorder) throw new Error('Recorder not started');

    const stopped = new Promise<void>((resolve) => {
      this.mediaRecorder!.onstop = () => resolve();
    });
    this.mediaRecorder.stop();
    await stopped;

    const blob = new Blob(this.chunks, { type: 'audio/webm' });
    const processed = await applyEchoCancellation(blob);
    this.chunks = [];

    // Trigger a browser download for the processed file.
    const link = document.createElement('a');
    link.href = URL.createObjectURL(processed);
    link.download = filename;
    link.click();
    return processed;
  }
}

export default new RecorderService();
