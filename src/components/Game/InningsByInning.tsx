'use client';

import { useMemo } from 'react';
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
} from '@mui/material';
import type { LineScore } from '@/types';

interface InningsByInningProps {
  linescore?: LineScore;
}

export function InningsByInning({ linescore }: InningsByInningProps) {
  const displayData = useMemo(() => {
    if (!linescore?.innings || linescore.innings.length === 0) {
      return null;
    }

    return linescore;
  }, [linescore]);

  if (!displayData) {
    return (
      <Alert severity="info">
        Inning-by-inning data not available
      </Alert>
    );
  }

  const { innings } = displayData;

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
          Inning by Inning
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
                    backgroundColor: '#f5f5f5',
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
                >
                  {inning.away?.runs ?? '-'}
                </TableCell>
              ))}
              <TableCell align="center" sx={{ fontWeight: 500 }}>
                {innings.reduce(
                  (sum, inning) => sum + (inning.away?.runs ?? 0),
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
                >
                  {inning.home?.runs ?? '-'}
                </TableCell>
              ))}
              <TableCell align="center" sx={{ fontWeight: 500 }}>
                {innings.reduce(
                  (sum, inning) => sum + (inning.home?.runs ?? 0),
                  0
                )}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
