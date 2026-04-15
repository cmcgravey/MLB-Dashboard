'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Alert,
  Skeleton,
  Stack,
} from '@mui/material';

interface InningData {
  away: number | null;
  home: number | null;
}

interface LineScore {
  currentInning: number;
  inningState: string;
  innings: InningData[];
}

interface GameLiveData {
  linescore: LineScore;
}

interface GameData {
  gamePk: number;
  liveData: GameLiveData;
}

interface InningsByInningProps {
  gamePk: number;
}

const BASE_URL = 'https://statsapi.mlb.com/api/v1';

export function InningsByInning({ gamePk }: InningsByInningProps) {
  const [lineScore, setLineScore] = useState<LineScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLineScore = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${BASE_URL}/game/${gamePk}`, {
          next: { revalidate: 300 },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch game data: ${response.statusText}`);
        }

        const data: GameData = await response.json();
        setLineScore(data.liveData.linescore);
        setError(null);
      } catch (err) {
        setError('Failed to load inning data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLineScore();
  }, [gamePk]);

  if (loading) {
    return (
      <Paper elevation={2} sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Skeleton variant="text" height={40} />
          <Skeleton variant="rectangular" height={120} />
        </Stack>
      </Paper>
    );
  }

  if (error) {
    return (
      <Alert severity="warning">
        {error}
      </Alert>
    );
  }

  if (!lineScore) {
    return (
      <Alert severity="info">
        Game data not yet available
      </Alert>
    );
  }

  const { innings, currentInning, inningState } = lineScore;

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
          Inning by Inning
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {inningState && `Current: ${inningState}`}
        </Typography>
      </Box>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 600 }}>Inning</TableCell>
              {innings.map((_, idx) => (
                <TableCell
                  key={`header-${idx}`}
                  align="center"
                  sx={{
                    fontWeight: 600,
                    backgroundColor:
                      idx + 1 === currentInning ? '#FFF176' : '#f5f5f5',
                  }}
                >
                  {idx + 1}
                </TableCell>
              ))}
              <TableCell align="center" sx={{ fontWeight: 600 }}>
                R
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* Away Team Row */}
            <TableRow>
              <TableCell sx={{ fontWeight: 500 }}>Away</TableCell>
              {innings.map((inning, idx) => (
                <TableCell
                  key={`away-${idx}`}
                  align="center"
                  sx={{
                    backgroundColor:
                      idx + 1 === currentInning ? '#FFF9C4' : 'transparent',
                  }}
                >
                  {inning.away !== null ? inning.away : '-'}
                </TableCell>
              ))}
              <TableCell align="center" sx={{ fontWeight: 500 }}>
                {innings.reduce(
                  (sum, inning) => sum + (inning.away ?? 0),
                  0
                )}
              </TableCell>
            </TableRow>

            {/* Home Team Row */}
            <TableRow>
              <TableCell sx={{ fontWeight: 500 }}>Home</TableCell>
              {innings.map((inning, idx) => (
                <TableCell
                  key={`home-${idx}`}
                  align="center"
                  sx={{
                    backgroundColor:
                      idx + 1 === currentInning ? '#FFF9C4' : 'transparent',
                  }}
                >
                  {inning.home !== null ? inning.home : '-'}
                </TableCell>
              ))}
              <TableCell align="center" sx={{ fontWeight: 500 }}>
                {innings.reduce(
                  (sum, inning) => sum + (inning.home ?? 0),
                  0
                )}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {currentInning && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
          ✓ Current inning: {currentInning}
        </Typography>
      )}
    </Paper>
  );
}
