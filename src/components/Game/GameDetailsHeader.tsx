import { Box, Typography, Stack, Paper } from '@mui/material';
import type { GameBoxScore } from '@/types';

interface GameDetailsHeaderProps {
  boxScore: GameBoxScore;
  gameDate: string;
  homeScore: number;
  awayScore: number;
}

export function GameDetailsHeader({ boxScore, gameDate, homeScore, awayScore }: GameDetailsHeaderProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        backgroundColor: 'background.paper',
        borderRadius: 2,
      }}
    >
      <Stack spacing={3}>
        {/* Date */}
        {gameDate && (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
            {formatDate(gameDate)}
          </Typography>
        )}

        {/* Score Display */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
          }}
        >
          {/* Away Team */}
          <Box sx={{ textAlign: 'center', flex: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
              {boxScore.awayTeam}
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, color: '#CC3433' }}>
              {awayScore}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {boxScore.awayPlayers.length} players with stats
            </Typography>
          </Box>

          {/* Divider */}
          <Typography variant="h6" color="text.secondary" sx={{ mx: 2 }}>
            @
          </Typography>

          {/* Home Team */}
          <Box sx={{ textAlign: 'center', flex: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
              {boxScore.homeTeam}
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, color: '#CC3433' }}>
              {homeScore}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {boxScore.homePlayers.length} players with stats
            </Typography>
          </Box>
        </Box>
      </Stack>
    </Paper>
  );
}
