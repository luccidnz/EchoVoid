import { PixelRatio, AccessibilityInfo } from 'react-native';

let screenReaderEnabled = false;

AccessibilityInfo.isScreenReaderEnabled().then(enabled => {
  screenReaderEnabled = enabled;
});

AccessibilityInfo.addEventListener &&
  AccessibilityInfo.addEventListener('screenReaderChanged', (enabled) => {
    screenReaderEnabled = enabled;
  });

export function scaleFont(size: number) {
  const fontScale = PixelRatio.getFontScale();
  const accessibilityScale = screenReaderEnabled ? 1.2 : 1;
  return size * fontScale * accessibilityScale;
}
