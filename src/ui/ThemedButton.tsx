import React, { ButtonHTMLAttributes } from 'react';
import { useTheme } from '../theme/ThemeProvider';

export const ThemedButton = (
  props: ButtonHTMLAttributes<HTMLButtonElement>
) => {
  const { theme } = useTheme();
  return (
    <button
      {...props}
      style={{
        backgroundColor: theme.primary,
        color: theme.text,
        border: `1px solid ${theme.accent}`,
        padding: '8px 16px',
      }}
    />
  );
};

export default ThemedButton;
