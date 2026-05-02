import Link from 'next/link';
import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
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
            <TableCell sx={{ fontWeight: 600 }}>Jersey</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
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
              <TableCell>
                <Link
                  href={`/player/${player.id}`}
                  style={{
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                >
                  <Typography sx={{ fontWeight: 600 }}>
                    {player.name}
                  </Typography>
                </Link>
              </TableCell>
              <TableCell>{player.position}</TableCell>
              <TableCell>{player.jerseyNumber ?? '—'}</TableCell>
              <TableCell>{player.status ?? '—'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
