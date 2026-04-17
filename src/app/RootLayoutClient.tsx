'use client';

import { CssBaseline, ThemeProvider } from '@mui/material';
import theme from '@/theme';
import { GameProvider } from '@/context/GameContext';

export function RootLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider theme={theme}>
      <GameProvider>
        <CssBaseline />
        {children}
      </GameProvider>
    </ThemeProvider>
  );
}
