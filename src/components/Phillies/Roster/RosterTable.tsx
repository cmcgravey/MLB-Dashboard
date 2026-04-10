import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import type { Player } from '@/types';

interface RosterTableProps {
  players: Player[];
}

export function RosterTable({ players }: RosterTableProps) {
  return (
    <TableContainer component={Card}>
      <Table>
        <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Position</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {players.map((player) => (
            <TableRow
              key={player.id}
              sx={{
                '&:hover': {
                  backgroundColor: '#fafafa',
                },
              }}
            >
              <TableCell>{player.name}</TableCell>
              <TableCell>{player.position}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
