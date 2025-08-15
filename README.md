# Hold That Thought

A one-tap, voice-first mobile application to instantly capture and organize fleeting thoughts. Built with Flutter for Android, iOS, and Web.

This repository contains the full source code, manually scaffolded to support production builds on all three platforms without requiring local execution of `flutter create`.

## Core Features

- **One-Tap Capture:** Press the giant button to start recording. The app saves a 10-second pre-roll of audio so you don't miss the beginning of your thought.
- **Voice & Text:** Toggle between voice memos and quick text notes.
- **Auto-Transcription & Categorization:** Voice notes are automatically transcribed and assigned a category using Google Cloud AI.
- **Local-First Storage:** All thoughts are saved locally. Free users have access to notes for 7 days.
- **Cross-Platform Sync (Pro):** Pro users can sync their thoughts across devices using Firebase.
- **Powerful Organization:** Search, filter, and use custom categories (Pro) to manage your thoughts.
- **Light & Dark Themes:** High-contrast, accessible UI that respects system settings.

## Tech Stack & Design Rationale

This project is built with a "Dart-only" and "low-disk" mindset. The goal is maximum portability and a lean footprint, avoiding native C/C++/NDK dependencies entirely.

- **Framework:** [Flutter (Stable)](https://flutter.dev/)
- **State Management:** [Riverpod](https://riverpod.dev/)
- **Navigation:** [GoRouter](https://pub.dev/packages/go_router)
- **Local Database: Isar**
  - **Rationale:** I chose **Isar** over Hive for several reasons. While Hive is a great key-value store, Isar is a full-fledged, ACID-compliant, and queryable NoSQL database. Its high performance, typed objects (no manual serialization), and support for complex queries including full-text search make it a better fit for the feature requirements of this app, such as searching through transcripts and filtering by multiple criteria. It is also written in pure Dart, aligning with our no-native-code constraint.
- **Audio:**
  - `record`: For capturing raw PCM audio from the microphone.
  - `just_audio`: For playback with fine-grained controls.
  - `lib/audio/audio_engine.dart`: A custom, pure Dart engine that manages a 10-second pre-roll ring buffer and handles WAV file encoding.
- **Backend:** [Firebase](https://firebase.google.com/)
  - **Services:** Auth, Firestore, Storage, Remote Config, Crashlytics, Analytics, Cloud Functions (Node.js 20).
- **Cloud AI:**
  - **Transcription:** Google Cloud Speech-to-Text v2
  - **Categorization:** Google Cloud Vertex AI (Text models)
- **Payments:** In-App Purchase (Google Play Billing & Apple StoreKit)
- **Notifications:** `flutter_local_notifications`

### No-NDK Philosophy

The Android build is configured to **avoid the NDK**. This simplifies the CI/CD pipeline, reduces compile times, shrinks the final APK size, and eliminates a common source of platform-specific bugs. All functionality that might typically rely on native code (like audio processing) has been implemented in pure Dart.

## Local Development Setup

You can clone this repository and run the app without needing to run `flutter create`.

### 1. Prerequisites
- Install the [Flutter SDK](https://docs.flutter.dev/get-started/install) (stable channel).
- An editor like VS Code or Android Studio.

### 2. Firebase Setup
1. Create a new Firebase project.
2. Enable **Authentication** (Email/Password, Google, Apple), **Firestore**, **Storage**, and **Remote Config**.
3. Register three apps in your Firebase project: Android, iOS, and Web.
   - **Android:** Use package name `com.example.hold_that_thought`. Download the `google-services.json` file and place it in `android/app/`.
   - **iOS:** Use bundle ID `com.example.holdThatThought`. Download the `GoogleService-Info.plist` file and place it in `ios/Runner/`.
   - **Web:** Get the Firebase configuration object. You will need to add this to `web/index.html`.
4. **Enable App Check** for all platforms to protect your backend resources.

### 3. Google Cloud Setup
1. In the Google Cloud Console (linked to your Firebase project), enable the **Cloud Speech-to-Text API** and the **Vertex AI API**.
2. Set up a service account with the necessary permissions for these APIs and for Cloud Functions execution.

### 4. Running the App
```bash
# Get all dependencies
flutter pub get

# Run on your desired platform
flutter run -d chrome # Web (recommended for fast UI development)
flutter run -d macos # (Requires macOS setup)
flutter run -d <your_device_id> # Android or iOS
```

## Build & CI

The GitHub Actions workflow in `.github/workflows/build.yml` demonstrates how to build the app.

- **Web:** The web build is straightforward and can be run on any machine with Flutter installed.
  ```bash
  flutter build web
  ```
- **Android (APK):** The Android build is configured to produce an APK.
  ```bash
  flutter build apk --release
  ```
- **CI Disk-Friendly Tips:** The `scripts/cleanup_ci.sh` script is provided to clear Gradle and Flutter caches, which can consume significant disk space on build runners. This is useful for environments with limited storage. For more complex needs, consider a dedicated build runner like Codemagic or a larger self-hosted runner.
---
*This project was scaffolded by an AI assistant.*
