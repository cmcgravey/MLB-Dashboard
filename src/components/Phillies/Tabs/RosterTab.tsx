import type { Player } from '@/types';
import { RosterTable } from '../Roster/RosterTable';
import { EmptyState } from '../Common/EmptyState';

interface RosterTabProps {
  players: Player[];
  isLoading: boolean;
}

export function RosterTab({ players, isLoading }: RosterTabProps) {
  if (!isLoading && players.length === 0) {
    return <EmptyState message="No roster data available." />;
  }

  return <RosterTable players={players} />;
}
