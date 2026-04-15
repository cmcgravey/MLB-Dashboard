'use client';

import { useParams, useRouter } from 'next/navigation';
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
import type { GameBoxScore } from '@/types';
import { GameDetailsHeader } from '@/components/Game/GameDetailsHeader';
import { InningsByInning } from '@/components/Game/InningsByInning';
import { PlayerStatsViewer } from '@/components/Game/PlayerStatsViewer';
import { LoadingState } from '@/components/Phillies/Common/LoadingState';

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const gamePk = params.gamePk as string;

  const [boxScore, setBoxScore] = useState<GameBoxScore | null>(null);
  const [gameDate, setGameDate] = useState<string>('');
  const [homeScore, setHomeScore] = useState<number>(0);
  const [awayScore, setAwayScore] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const gamePkNum = parseInt(gamePk, 10);
        
        // Fetch both boxscore and game data
        const [boxScoreData, gameData] = await Promise.all([
          getGameBoxScore(gamePkNum),
          fetch(`https://statsapi.mlb.com/api/v1/game/${gamePkNum}`, {
            next: { revalidate: 300 },
          }).then(res => res.json()),
        ]);

        setBoxScore(boxScoreData);
        setGameDate(gameData.gameData?.datetime?.dateTime ?? '');
        setHomeScore(gameData.liveData?.linescore?.teams?.home?.runs ?? 0);
        setAwayScore(gameData.liveData?.linescore?.teams?.away?.runs ?? 0);
        setError(null);
      } catch (err) {
        setError('Failed to load game details. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (gamePk) {
      fetchData();
    }
  }, [gamePk]);

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
            <InningsByInning gamePk={parseInt(gamePk, 10)} />

            {/* Player Stats Tabs */}
            <PlayerStatsViewer boxScore={boxScore} />
          </Stack>
        )}
      </Box>
    </Container>
  );
}
