import { TextStyle } from 'react-native';

export interface Typography {
  heading1: TextStyle;
  heading2: TextStyle;
  heading3: TextStyle;
  body: TextStyle;
  label: TextStyle;
  caption: TextStyle;
  small: TextStyle;
  button: TextStyle;
  display: TextStyle;
}

export const typography: Typography = {
  display: { fontSize: 40, fontWeight: '900', letterSpacing: 1 },
  heading1: { fontSize: 28, fontWeight: '800', letterSpacing: 0.5 },
  heading2: { fontSize: 24, fontWeight: '700' },
  heading3: { fontSize: 20, fontWeight: '700' },
  body: { fontSize: 16, fontWeight: '400' },
  label: { fontSize: 16, fontWeight: '600' },
  caption: { fontSize: 13, fontWeight: '400' },
  small: { fontSize: 12, fontWeight: '400' },
  button: { fontSize: 16, fontWeight: '700', letterSpacing: 0.4 },
};
