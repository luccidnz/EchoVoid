# EchoVoid: Spirit Communicator (Expo SDK 53)

## Requirements

* Node 18–20 (avoid Node 22)
* Android device with Expo Go installed

## Install \& Run

npm install
npx expo install expo-av expo-file-system expo-sensors expo-speech \
'@react-navigation/native' '@react-navigation/native-stack' react-native-screens \
react-native-safe-area-context react-native-gesture-handler react-native-reanimated

# (Optional voice)

npm i @react-native-voice/voice

# Start (Expo Go)

npx expo start --tunnel

## Notes

* If RN‑Voice is unavailable in Expo Go, transcription gracefully falls back; TTS + visuals still work.
* Do not add direct metro versions; let Expo resolve.

## Testing

npm test

## Extras

This scaffold includes stubs for cloud sync, shared sessions, anomaly detection, AR mode, voice cloning, advanced sweep presets, accessibility themes, privacy controls, and feedback channels.

