import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { lightPalette, darkPalette, Palette } from './themes';

export type ThemeName = 'light' | 'dark';

interface ThemeContextValue {
  theme: Palette;
  themeName: ThemeName;
  setThemeName: (name: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: lightPalette,
  themeName: 'light',
  setThemeName: () => {},
});

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [themeName, setThemeName] = useState<ThemeName>(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('theme') : null;
    return stored === 'dark' ? 'dark' : 'light';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', themeName);
    }
  }, [themeName]);

  const theme = themeName === 'dark' ? darkPalette : lightPalette;

  return (
    <ThemeContext.Provider value={{ theme, themeName, setThemeName }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
