'use client';

import { useState } from 'react';
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Stack,
  Chip,
} from '@mui/material';
import type { GameBoxScore, PlayerStat } from '@/types';

interface PlayerStatsViewerProps {
  boxScore: GameBoxScore;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`team-tabpanel-${index}`}
      aria-labelledby={`team-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function HittingStatsTable({ players }: { players: PlayerStat[] }) {
  // Filter for hitters (players with at least batting stats)
  const hitters = players
    .filter(p => p.atBats !== undefined || p.hits !== undefined)
    .sort((a, b) => {
      // Sort by batting order if available
      const orderA = a.battingOrder ?? Infinity;
      const orderB = b.battingOrder ?? Infinity;
      return orderA - orderB;
    });

  if (hitters.length === 0) {
    return (
      <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
        No hitting stats available
      </Typography>
    );
  }

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
            <TableCell sx={{ fontWeight: 600 }}>Player</TableCell>
            <TableCell align="center" sx={{ fontWeight: 600 }}>
              AB
            </TableCell>
            <TableCell align="center" sx={{ fontWeight: 600 }}>
              H
            </TableCell>
            <TableCell align="center" sx={{ fontWeight: 600 }}>
              BB
            </TableCell>
            <TableCell align="center" sx={{ fontWeight: 600 }}>
              K
            </TableCell>
            <TableCell align="center" sx={{ fontWeight: 600 }}>
              HR
            </TableCell>
            <TableCell align="center" sx={{ fontWeight: 600 }}>
              RBI
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {hitters.map((player, idx) => (
            <TableRow key={idx} sx={{ '&:nth-of-type(odd)': { backgroundColor: '#fafafa' } }}>
              <TableCell sx={{ pl: player.isPinchHitter ? 4 : 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {player.isPinchHitter ? 'p-' : ''}{player.name}
                </Typography>
              </TableCell>
              <TableCell align="center">
                {player.atBats !== undefined ? player.atBats : '—'}
              </TableCell>
              <TableCell align="center">
                {player.hits !== undefined ? player.hits : '—'}
              </TableCell>
              <TableCell align="center">
                {player.walks !== undefined ? player.walks : '—'}
              </TableCell>
              <TableCell align="center">
                {player.strikeOuts !== undefined ? player.strikeOuts : '—'}
              </TableCell>
              <TableCell align="center">
                {player.homeRuns !== undefined ? player.homeRuns : '—'}
              </TableCell>
              <TableCell align="center">
                {player.rbi !== undefined ? player.rbi : '—'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function PitchingStatsTable({ players }: { players: PlayerStat[] }) {
  // Filter for pitchers (players with pitching stats) and sort by appearance order
  const pitchers = players
    .filter(p => p.inningsPitched !== undefined)
    .sort((a, b) => {
      const orderA = a.pitchingOrder ?? Infinity;
      const orderB = b.pitchingOrder ?? Infinity;
      return orderA - orderB;
    });

  if (pitchers.length === 0) {
    return (
      <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
        No pitching stats available
      </Typography>
    );
  }

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
            <TableCell sx={{ fontWeight: 600 }}>Pitcher</TableCell>
            <TableCell align="center" sx={{ fontWeight: 600 }}>
              IP
            </TableCell>
            <TableCell align="center" sx={{ fontWeight: 600 }}>
              H
            </TableCell>
            <TableCell align="center" sx={{ fontWeight: 600 }}>
              R
            </TableCell>
            <TableCell align="center" sx={{ fontWeight: 600 }}>
              ER
            </TableCell>
            <TableCell align="center" sx={{ fontWeight: 600 }}>
              BB
            </TableCell>
            <TableCell align="center" sx={{ fontWeight: 600 }}>
              K
            </TableCell>
            <TableCell align="center" sx={{ fontWeight: 600 }}>
              HR
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {pitchers.map((player, idx) => (
            <TableRow key={idx} sx={{ '&:nth-of-type(odd)': { backgroundColor: '#fafafa' } }}>
              <TableCell>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {player.name}
                </Typography>
              </TableCell>
              <TableCell align="center">
                {player.inningsPitched ? (
                  <Chip
                    label={player.inningsPitched}
                    size="small"
                    variant="outlined"
                  />
                ) : (
                  '—'
                )}
              </TableCell>
              <TableCell align="center">
                {player.pitchingHits !== undefined ? player.pitchingHits : '—'}
              </TableCell>
              <TableCell align="center">
                {player.runs !== undefined ? player.runs : '—'}
              </TableCell>
              <TableCell align="center">
                {player.earnedRuns !== undefined ? player.earnedRuns : '—'}
              </TableCell>
              <TableCell align="center">
                {player.pitchingWalks !== undefined ? player.pitchingWalks : '—'}
              </TableCell>
              <TableCell align="center">
                {player.strikeOuts !== undefined ? player.strikeOuts : '—'}
              </TableCell>
              <TableCell align="center">
                {player.pitchingHomeRuns !== undefined ? player.pitchingHomeRuns : '—'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export function PlayerStatsViewer({ boxScore }: PlayerStatsViewerProps) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Player Statistics
        </Typography>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={activeTab}
          onChange={(event, newValue) => setActiveTab(newValue)}
          aria-label="team stats tabs"
        >
          <Tab label={`${boxScore.homeTeam} (Home)`} id="team-tab-0" />
          <Tab label={`${boxScore.awayTeam} (Away)`} id="team-tab-1" />
        </Tabs>
      </Box>

      <TabPanel value={activeTab} index={0}>
        <Stack spacing={4}>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
              Hitting
            </Typography>
            <HittingStatsTable players={boxScore.homePlayers} />
          </Box>

          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
              Pitching
            </Typography>
            <PitchingStatsTable players={boxScore.homePlayers} />
          </Box>
        </Stack>
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <Stack spacing={4}>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
              Hitting
            </Typography>
            <HittingStatsTable players={boxScore.awayPlayers} />
          </Box>

          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
              Pitching
            </Typography>
            <PitchingStatsTable players={boxScore.awayPlayers} />
          </Box>
        </Stack>
      </TabPanel>
    </Paper>
  );
}
