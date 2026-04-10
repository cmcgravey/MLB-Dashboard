import { Grid } from '@mui/material';
import type { Game } from '@/types';
import { GameCard } from '../Games/GameCard';
import { EmptyState } from '../Common/EmptyState';

interface RecentGamesTabProps {
  games: Game[];
  isLoading: boolean;
}

export function RecentGamesTab({ games, isLoading }: RecentGamesTabProps) {
  if (!isLoading && games.length === 0) {
    return <EmptyState message="No games found." />;
  }

  return (
    <Grid container spacing={3}>
      {[...games].reverse().map((game) => (
        <Grid item xs={12} sm={6} md={3} key={game.id}>
          <GameCard game={game} />
        </Grid>
      ))}
    </Grid>
  );
}
