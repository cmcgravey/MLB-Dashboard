'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Button,
  Alert,
  Stack,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getGameBoxScore } from '@/lib/mlb';
import { useGame } from '@/context/GameContext';
import type { GameBoxScore } from '@/types';
import { GameDetailsHeader } from '@/components/Game/GameDetailsHeader';
import { InningsByInning } from '@/components/Game/InningsByInning';
import { PlayerStatsViewer } from '@/components/Game/PlayerStatsViewer';
import { LoadingState } from '@/components/Phillies/Common/LoadingState';
import type { LineScore } from '@/types';

export default function GamePage() {
  const router = useRouter();
  const { selectedGame } = useGame();

  const [boxScore, setBoxScore] = useState<GameBoxScore | null>(null);
  const [gameDate, setGameDate] = useState<string>(selectedGame?.date ?? '');
  const [homeScore, setHomeScore] = useState<number>(selectedGame?.homeScore ?? 0);
  const [awayScore, setAwayScore] = useState<number>(selectedGame?.awayScore ?? 0);
  const [linescore, setLinescore] = useState<LineScore | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Use game link from context, which contains all data (boxscore + linescore)
        if (selectedGame?.gameLink) {
          // Set game info from context
          setGameDate(selectedGame.date);
          setHomeScore(selectedGame.homeScore);
          setAwayScore(selectedGame.awayScore);
          
          // Fetch game data using the link from schedule response
          const boxScoreData = await getGameBoxScore(selectedGame.gameLink);
          setBoxScore(boxScoreData);
          setLinescore(boxScoreData.linescore);
        } else {
          // Fallback: if no context, need at least the gamePk
          throw new Error('Game information not available. Please select a game from the dashboard.');
        }
        setError(null);
      } catch (err) {
        setError('Failed to load game details. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (selectedGame?.gameLink) {
      fetchData();
    }
  }, [selectedGame]);

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Back Button */}
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.back()}
          sx={{ mb: 3 }}
          color="inherit"
        >
          Back to Dashboard
        </Button>

        {loading && <LoadingState />}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {!loading && boxScore && (
          <Stack spacing={4}>
            {/* Game Header */}
            <GameDetailsHeader boxScore={boxScore} gameDate={gameDate} homeScore={homeScore} awayScore={awayScore} />

            {/* Inning by Inning */}
            <InningsByInning linescore={linescore} />

            {/* Player Stats Tabs */}
            <PlayerStatsViewer boxScore={boxScore} />
          </Stack>
        )}
      </Box>
    </Container>
  );
}
