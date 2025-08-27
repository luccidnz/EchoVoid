import React, { createContext, useContext, useState, useEffect, PropsWithChildren } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeName = 'Void' | 'NeonFlux' | 'Astral';

export interface Theme {
  name: ThemeName;
  colors: {
    bg: string;
    surface: string;
    primary: string;
    accent: string;
    text: string;
    danger: string;
  };
  spacing: number[];
  radii: number[];
  shadow: string;
  opacity: { [k: string]: number };
}

export const themes: Record<ThemeName, Theme> = {
  Void: {
    name: 'Void',
    colors: {
      bg: '#0A0B0E', surface: '#12131A', primary: '#7D5CFF', accent: '#00E0FF', text: '#E7ECF2', danger: '#FF4D6D',
    },
    spacing: [0, 4, 8, 16, 24, 32],
    radii: [0, 6, 12, 20],
    shadow: '0 2px 8px #0008',
    opacity: { disabled: 0.4, overlay: 0.12 },
  },
  NeonFlux: {
    name: 'NeonFlux',
    colors: {
      bg: '#0B0F10', surface: '#11161C', primary: '#00FFC6', accent: '#FF2DFE', text: '#DDE7EA', danger: '#FF4D6D',
    },
    spacing: [0, 4, 8, 16, 24, 32],
    radii: [0, 6, 12, 20],
    shadow: '0 2px 8px #0008',
    opacity: { disabled: 0.4, overlay: 0.12 },
  },
  Astral: {
    name: 'Astral',
    colors: {
      bg: '#0C0A12', surface: '#151224', primary: '#8AE6FF', accent: '#E6C3FF', text: '#F2F5FF', danger: '#FF4D6D',
    },
    spacing: [0, 4, 8, 16, 24, 32],
    radii: [0, 6, 12, 20],
    shadow: '0 2px 8px #0008',
    opacity: { disabled: 0.4, overlay: 0.12 },
  },
};

interface ThemeContextType {
  theme: Theme;
  setTheme: (t: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextType>({ theme: themes.Void, setTheme: () => {} });

export function ThemeProvider({ children }: PropsWithChildren<{}>) {
  const [themeName, setThemeName] = useState<ThemeName>('Void');
  useEffect(() => {
    AsyncStorage.getItem('theme').then((t: any) => { if (t && themes[t as ThemeName]) setThemeName(t as ThemeName); });
  }, []);
  const setTheme = (t: ThemeName) => {
    setThemeName(t);
    AsyncStorage.setItem('theme', t);
  };
  return (
    <ThemeContext.Provider value={{ theme: themes[themeName], setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() { return useContext(ThemeContext); }
