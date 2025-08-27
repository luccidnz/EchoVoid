/**
 * ErrorHandler captures unhandled exceptions and forwards them to a crash
 * reporting service. The crash service can be any provider implementing
 * the simple `recordError` interface used here.
 */
export class ErrorHandler {
  private enabled = true;

  constructor(private crashService?: { recordError: (error: any) => Promise<void> | void }) {
    // Bind the handler to the global error events where available.
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (e) => this.capture(e.error));
      window.addEventListener('unhandledrejection', (e) => this.capture(e.reason));
    }
  }

  /**
   * Enable or disable crash reporting.
   */
  setEnabled(value: boolean) {
    this.enabled = value;
  }

  /**
   * Capture an error and send it to the crash reporting service if enabled.
   */
  async capture(error: any): Promise<void> {
    if (!this.enabled) return;
    try {
      await this.crashService?.recordError(error);
    } catch (err) {
      console.error('Crash service failed', err);
    }
  }
}
