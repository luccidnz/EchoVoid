import React, { useState } from 'react';
import { AnalyticsService } from '../analytics/analytics_service';
import { ErrorHandler } from '../errors/error_handler';

const analytics = new AnalyticsService();
const errorHandler = new ErrorHandler();

/**
 * SettingsScreen exposes toggles allowing the user to opt in or out of
 * analytics and crash reporting.
 */
export function SettingsScreen() {
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [crashEnabled, setCrashEnabled] = useState(true);

  const toggleAnalytics = () => {
    const next = !analyticsEnabled;
    setAnalyticsEnabled(next);
    analytics.setEnabled(next);
  };

  const toggleCrash = () => {
    const next = !crashEnabled;
    setCrashEnabled(next);
    errorHandler.setEnabled(next);
  };

  return (
    <div>
      <h1>Settings</h1>
      <label>
        <input type="checkbox" checked={analyticsEnabled} onChange={toggleAnalytics} />
        Enable analytics
      </label>
      <label>
        <input type="checkbox" checked={crashEnabled} onChange={toggleCrash} />
        Enable crash reporting
      </label>
    </div>
  );
}
