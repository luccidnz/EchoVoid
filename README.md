# EchoVoid

This project demonstrates basic analytics and error-reporting integrations. Users may opt in or out of these features at any time.

## Analytics

Analytics events are sent through `AnalyticsService` which can be configured with a provider such as Firebase Analytics. The service can be disabled in the settings screen or programmatically via `setEnabled(false)`.

## Crash Reporting

Unhandled exceptions are captured by `ErrorHandler` and forwarded to a crash-reporting provider. Crash reporting can also be disabled from the settings screen or programmatically.

## User Controls

The **Settings** screen exposes toggles for both analytics and crash reporting so users can decide whether to share diagnostic information.
