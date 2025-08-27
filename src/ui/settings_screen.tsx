import React from 'react';
import { useTheme } from '../theme/ThemeProvider';

export const SettingsScreen = () => {
  const { theme, themeName, setThemeName } = useTheme();

  const toggle = () => setThemeName(themeName === 'dark' ? 'light' : 'dark');

  return (
    <div
      style={{
        background: theme.background,
        color: theme.text,
        minHeight: '100vh',
        padding: 16,
      }}
    >
      <h1>Settings</h1>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span>Dark Mode</span>
        <input type="checkbox" checked={themeName === 'dark'} onChange={toggle} />
      </label>
    </div>
  );
};

export default SettingsScreen;
