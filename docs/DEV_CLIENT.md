# Ech0Void Dev Client Setup

## Install Native Dependencies

```
npx expo install expo-speech expo-av expo-sensors expo-haptics expo-file-system expo-sharing react-native-svg react-native-gesture-handler react-native-reanimated expo-blur expo-application react-native-view-shot
```

## Generate Dev Client

```
npx expo prebuild
npx expo run:android --device   # or: eas build --profile development --platform android
# iOS: npx expo run:ios --device  (or eas build -p ios --profile development)
```

## Notes
- Use Dev Client to unlock native features (TTS voices, AR, etc).
- Expo Go is limited for some features (see Settings tooltips).
