'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface GameContextType {
  selectedGame: {
    id: number;
    date: string;
    homeScore: number;
    awayScore: number;
    gameLink: string;
  } | null;
  setSelectedGame: (game: {
    id: number;
    date: string;
    homeScore: number;
    awayScore: number;
    gameLink: string;
  } | null) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [selectedGame, setSelectedGame] = useState<GameContextType['selectedGame']>(null);

  return (
    <GameContext.Provider value={{ selectedGame, setSelectedGame }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
