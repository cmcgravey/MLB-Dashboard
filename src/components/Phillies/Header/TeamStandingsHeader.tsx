import { Typography, Box, Stack } from '@mui/material';
import type { TeamStanding } from '@/types';

interface TeamStandingsHeaderProps {
  standing: TeamStanding | null;
}

export function TeamStandingsHeader({ standing }: TeamStandingsHeaderProps) {
  return (
    <>
      <Typography
        variant="h3"
        component="h1"
        sx={{
          fontWeight: 'bold',
          mb: 2,
          color: '#CC3433', // Phillies red
        }}
      >
        Philadelphia Phillies
      </Typography>

      {standing && (
        <Stack
          direction="row"
          spacing={3}
          sx={{
            mb: 4,
            pb: 2,
            borderBottom: '1px solid #eee',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="caption" color="text.secondary">
              Record
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {standing.wins}-{standing.losses}
            </Typography>
          </Box>

          <Box>
            <Typography variant="caption" color="text.secondary">
              Division Rank
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              #{standing.divisionRank}
            </Typography>
          </Box>

          <Box>
            <Typography variant="caption" color="text.secondary">
              Games Back
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {standing.gamesBack}
            </Typography>
          </Box>

          {standing.streak !== '-' && (
            <Box>
              <Typography variant="caption" color="text.secondary">
                Streak
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 600,
                  color: standing.streak.startsWith('W')
                    ? '#CC3433'
                    : '#999',
                }}
              >
                {standing.streak}
              </Typography>
            </Box>
          )}
        </Stack>
      )}
    </>
  );
}
