import { colors } from '../colors';

// Full color map for high contrast variant
export const highContrastColors = {
  ...colors,
  bg: '#000000',
  card: '#000000',
  text: '#FFFFFF',
  subtext: '#FFFFFF',
  neon: '#00FFFF',
  neon2: '#FF00FF',
  accent: '#FF00FF',
  accent2: '#00FFFF',
  overlay: 'rgba(255,255,255,0.1)',
  danger: '#FF5555',
  line: '#FFFFFF',
};

export const HIGH_CONTRAST = highContrastColors;
