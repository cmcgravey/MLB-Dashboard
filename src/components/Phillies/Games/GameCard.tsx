'use client';

import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
  Chip,
} from '@mui/material';
import type { Game } from '@/types';
import { useGame } from '@/context/GameContext';

interface GameCardProps {
  game: Game;
}

export function GameCard({ game }: GameCardProps) {
  const router = useRouter();
  const { setSelectedGame } = useGame();
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getGameStatus = (status: string) => {
    if (status.toLowerCase().includes('scheduled')) {
      return { label: 'Scheduled', color: 'info' as const };
    }
    if (status.toLowerCase().includes('in progress')) {
      return { label: 'In Progress', color: 'warning' as const };
    }
    if (status.toLowerCase().includes('final')) {
      return { label: 'Final', color: 'default' as const };
    }
    return { label: status, color: 'default' as const };
  };

  const philliesIsHome = game.homeTeam === 'Philadelphia Phillies';
  const philliesScore = philliesIsHome ? game.homeScore : game.awayScore;
  const opponentScore = philliesIsHome ? game.awayScore : game.homeScore;
  const opponentTeam = philliesIsHome ? game.awayTeam : game.homeTeam;
  const won = philliesIsHome
    ? game.homeScore > game.awayScore
    : game.awayScore > game.homeScore;
  const status = getGameStatus(game.status);

  const handleNavigateToGame = () => {
    setSelectedGame({
      id: game.id,
      date: game.date,
      homeScore: game.homeScore,
      awayScore: game.awayScore,
      gameLink: game.gameLink,
    });
    router.push(`/game/${game.id}`);
  };

  return (
    <Card
      onClick={handleNavigateToGame}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderLeft: `5px solid ${won ? '#CC3433' : '#999'}`,
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 3,
        },
      }}
    >
      <CardContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          sx={{ mb: 2, alignItems: 'center' }}
        >
          <Typography variant="caption" color="text.secondary">
            {formatDate(game.date)}
          </Typography>
          <Chip
            label={status.label}
            size="small"
            color={status.color}
            variant="outlined"
          />
        </Stack>

        <Box sx={{ flex: 1 }}>
          <Stack spacing={1.5} sx={{ mb: 2 }}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                vs
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {opponentTeam}
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pt: 2,
            borderTop: '1px solid #eee',
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              Phillies
            </Typography>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 'bold',
                color: '#CC3433',
              }}
            >
              {philliesScore}
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary">
            -
          </Typography>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              {opponentTeam.split(' ').pop()}
            </Typography>
            <Typography
              variant="h5"
              sx={{ fontWeight: 'bold' }}
            >
              {opponentScore}
            </Typography>
          </Box>
        </Box>

        {won && (
          <Typography
            variant="caption"
            sx={{
              mt: 1.5,
              color: '#CC3433',
              fontWeight: 600,
              textAlign: 'center',
            }}
          >
            W
          </Typography>
        )}
        {!won && game.status.toLowerCase().includes('final') && (
          <Typography
            variant="caption"
            sx={{
              mt: 1.5,
              color: '#999',
              fontWeight: 600,
              textAlign: 'center',
            }}
          >
            L
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
