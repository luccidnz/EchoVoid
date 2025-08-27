export interface AnalyticsEvent {
  name: string;
  params?: Record<string, any>;
}

/**
 * AnalyticsService wraps an analytics provider (e.g., Firebase Analytics).
 * In production the provider would be initialised elsewhere and injected
 * into this service. For this repository a basic interface is provided.
 */
export class AnalyticsService {
  private enabled = true;

  constructor(private provider?: { logEvent: (name: string, params?: Record<string, any>) => Promise<void> | void }) {}

  /**
   * Enable or disable analytics collection.
   */
  setEnabled(value: boolean) {
    this.enabled = value;
  }

  /**
   * Log an analytics event via the provider if enabled.
   */
  async logEvent(event: AnalyticsEvent): Promise<void> {
    if (!this.enabled) return;
    try {
      await this.provider?.logEvent(event.name, event.params);
    } catch (err) {
      // Provider errors are swallowed so that analytics never break the app.
      console.error('Analytics provider failed', err);
    }
  }
}
