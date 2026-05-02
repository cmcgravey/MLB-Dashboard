'use client';

import Link from 'next/link';
import { useEffect, useState, use } from 'react';
import type { PlayerDetails, HittingStats, PitchingStats } from '@/types';
import {
  getPlayerDetails,
  getPlayerHittingStats,
  getPlayerCareerHittingStats,
  getPlayerPitchingStats,
  getPlayerCareerPitchingStats,
} from '@/lib/mlb';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Typography,
} from '@mui/material';

interface PlayerPageProps {
  params: {
    playerId: string;
  };
}

const formatValue = (value: string | number | undefined, fallback = '—') =>
  value !== undefined && value !== null ? value : fallback;

const statRow = (label: string, value: string | number | undefined) => (
  <TableRow>
    <TableCell sx={{ fontWeight: 600 }}>{label}</TableCell>
    <TableCell>{formatValue(value)}</TableCell>
  </TableRow>
);

export default function PlayerPage({ params }: PlayerPageProps) {
  const { playerId: playerIdStr } = use(params);
  const playerId = Number(playerIdStr);
  const [player, setPlayer] = useState<PlayerDetails | null>(null);
  const [hittingStats, setHittingStats] = useState<HittingStats | null>(null);
  const [careerHittingStats, setCareerHittingStats] = useState<HittingStats | null>(null);
  const [pitchingStats, setPitchingStats] = useState<PitchingStats | null>(null);
  const [careerPitchingStats, setCareerPitchingStats] = useState<PitchingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statsTab, setStatsTab] = useState<'season' | 'career'>('season');

  useEffect(() => {
    if (Number.isNaN(playerId)) {
      setError('Invalid player ID');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const [playerData, hitting, careerHitting, pitching, careerPitching] =
          await Promise.all([
            getPlayerDetails(playerId),
            getPlayerHittingStats(playerId),
            getPlayerCareerHittingStats(playerId),
            getPlayerPitchingStats(playerId),
            getPlayerCareerPitchingStats(playerId),
          ]);
        setPlayer(playerData);
        setHittingStats(hitting);
        setCareerHittingStats(careerHitting);
        setPitchingStats(pitching);
        setCareerPitchingStats(careerPitching);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load player data'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [playerId]);

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 6 }}>
          <Typography>Loading player data...</Typography>
        </Box>
      </Container>
    );
  }

  if (error || !player) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 6 }}>
          <Typography variant="h4" gutterBottom>
            {error || 'Player not found'}
          </Typography>
          <Button component={Link} href="/" variant="outlined">
            Back to roster
          </Button>
        </Box>
      </Container>
    );
  }

  const birthLocation = [
    player.birthCity,
    player.birthStateProvince,
    player.birthCountry,
  ]
    .filter(Boolean)
    .join(', ');

  const isPitcher = player.primaryPosition.toLowerCase().includes('pitcher');
  const hasHittingStats = Boolean(
    hittingStats &&
      (hittingStats.gamesPlayed ||
        hittingStats.homeRuns ||
        hittingStats.rbi ||
        hittingStats.ops)
  );
  const hasPitchingStats = Boolean(
    pitchingStats &&
      (pitchingStats.gamesPlayed || pitchingStats.wins || pitchingStats.era)
  );

  // Only show relevant stats based on position
  const showHittingStats = !isPitcher && hasHittingStats;
  const showPitchingStats = isPitcher && hasPitchingStats;

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 6 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={4}
        >
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {player.fullName}
            </Typography>
            <Typography color="text.secondary">
              {player.primaryPosition} • #{player.jerseyNumber ?? '—'} •{' '}
              {player.currentTeam}
            </Typography>
          </Box>
          <Button component={Link} href="/" variant="outlined">
            Back to roster
          </Button>
        </Stack>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Stack spacing={2}>
                  <Typography variant="h6">Player info</Typography>
                  <Stack spacing={1.5}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Status
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 0.5 }}>
                        <Chip
                          label={player.active ? 'Active' : 'Inactive'}
                          color={player.active ? 'success' : 'default'}
                          size="small"
                        />
                      </Stack>
                    </Box>

                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Details
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 0.5 }}>
                        <Chip label={`Bats: ${player.bats}`} size="small" variant="outlined" />
                        <Chip label={`Throws: ${player.throws}`} size="small" variant="outlined" />
                      </Stack>
                    </Box>
                  </Stack>

                  <TableContainer>
                    <Table size="small">
                      <TableBody>
                        {statRow('Full name', player.fullName)}
                        {statRow('Age', player.currentAge)}
                        {statRow('Debut', player.mlbDebutDate)}
                        {statRow('Birthdate', player.birthDate)}
                        {statRow('Birthplace', birthLocation)}
                        {statRow('Height', player.height)}
                        {statRow(
                          'Weight',
                          player.weight ? `${player.weight} lbs` : undefined
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
            <Stack spacing={3}>
              {(showHittingStats || careerHittingStats) && (
                <Card>
                  <CardContent>
                    <Stack spacing={2}>
                      <Typography variant="h6">Hitting Stats</Typography>
                      <Tabs
                        value={statsTab}
                        onChange={(_, value) =>
                          setStatsTab(value as 'season' | 'career')
                        }
                        sx={{ borderBottom: 1, borderColor: 'divider' }}
                      >
                        <Tab label="2026 Season" value="season" />
                        <Tab label="Career" value="career" />
                      </Tabs>

                      {statsTab === 'season' && showHittingStats && hittingStats ? (
                        <TableContainer>
                          <Table>
                            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                              <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>
                                  Metric
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>
                                  Value
                                </TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {statRow('Games', hittingStats.gamesPlayed)}
                              {statRow(
                                'Plate appearances',
                                hittingStats.plateAppearances
                              )}
                              {statRow('At bats', hittingStats.atBats)}
                              {statRow('Runs', hittingStats.runs)}
                              {statRow('Hits', hittingStats.hits)}
                              {statRow('Doubles', hittingStats.doubles)}
                              {statRow('Triples', hittingStats.triples)}
                              {statRow('Home runs', hittingStats.homeRuns)}
                              {statRow('RBI', hittingStats.rbi)}
                              {statRow('Walks', hittingStats.walks)}
                              {statRow('Strikeouts', hittingStats.strikeOuts)}
                              {statRow('Stolen bases', hittingStats.stolenBases)}
                              {statRow('AVG', hittingStats.avg)}
                              {statRow('OBP', hittingStats.obp)}
                              {statRow('SLG', hittingStats.slg)}
                              {statRow('OPS', hittingStats.ops)}
                              {statRow('Total bases', hittingStats.totalBases)}
                              {statRow('BABIP', hittingStats.babip)}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      ) : null}

                      {statsTab === 'career' && careerHittingStats ? (
                        <TableContainer>
                          <Table>
                            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                              <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>
                                  Metric
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>
                                  Value
                                </TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {statRow('Games', careerHittingStats.gamesPlayed)}
                              {statRow(
                                'Plate appearances',
                                careerHittingStats.plateAppearances
                              )}
                              {statRow('At bats', careerHittingStats.atBats)}
                              {statRow('Runs', careerHittingStats.runs)}
                              {statRow('Hits', careerHittingStats.hits)}
                              {statRow('Doubles', careerHittingStats.doubles)}
                              {statRow('Triples', careerHittingStats.triples)}
                              {statRow('Home runs', careerHittingStats.homeRuns)}
                              {statRow('RBI', careerHittingStats.rbi)}
                              {statRow('Walks', careerHittingStats.walks)}
                              {statRow(
                                'Strikeouts',
                                careerHittingStats.strikeOuts
                              )}
                              {statRow(
                                'Stolen bases',
                                careerHittingStats.stolenBases
                              )}
                              {statRow('AVG', careerHittingStats.avg)}
                              {statRow('OBP', careerHittingStats.obp)}
                              {statRow('SLG', careerHittingStats.slg)}
                              {statRow('OPS', careerHittingStats.ops)}
                              {statRow(
                                'Total bases',
                                careerHittingStats.totalBases
                              )}
                              {statRow('BABIP', careerHittingStats.babip)}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      ) : null}
                    </Stack>
                  </CardContent>
                </Card>
              )}

              {showPitchingStats || careerPitchingStats ? (
                <Card>
                  <CardContent>
                    <Stack spacing={2}>
                      <Typography variant="h6">Pitching Stats</Typography>
                      <Tabs
                        value={statsTab}
                        onChange={(_, value) =>
                          setStatsTab(value as 'season' | 'career')
                        }
                        sx={{ borderBottom: 1, borderColor: 'divider' }}
                      >
                        <Tab label="2026 Season" value="season" />
                        <Tab label="Career" value="career" />
                      </Tabs>

                      {statsTab === 'season' && showPitchingStats && pitchingStats ? (
                        <TableContainer>
                          <Table>
                            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                              <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>
                                  Metric
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>
                                  Value
                                </TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {statRow('Games', pitchingStats.gamesPlayed)}
                              {statRow('Wins', pitchingStats.wins)}
                              {statRow('Losses', pitchingStats.losses)}
                              {statRow('ERA', pitchingStats.era)}
                              {statRow(
                                'Games started',
                                pitchingStats.gamesStarted
                              )}
                              {statRow(
                                'Games finished',
                                pitchingStats.gamesFinished
                              )}
                              {statRow('Saves', pitchingStats.saves)}
                              {statRow(
                                'Innings pitched',
                                pitchingStats.inningsPitched
                              )}
                              {statRow('Strikeouts', pitchingStats.strikeOuts)}
                              {statRow('Walks', pitchingStats.walks)}
                              {statRow('Hits allowed', pitchingStats.hits)}
                              {statRow('Earned runs', pitchingStats.earnedRuns)}
                              {statRow('WHIP', pitchingStats.whip)}
                              {statRow('Pitch count', pitchingStats.pitchCount)}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      ) : null}

                      {statsTab === 'career' && careerPitchingStats ? (
                        <TableContainer>
                          <Table>
                            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                              <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>
                                  Metric
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>
                                  Value
                                </TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {statRow(
                                'Games',
                                careerPitchingStats.gamesPlayed
                              )}
                              {statRow('Wins', careerPitchingStats.wins)}
                              {statRow('Losses', careerPitchingStats.losses)}
                              {statRow('ERA', careerPitchingStats.era)}
                              {statRow(
                                'Games started',
                                careerPitchingStats.gamesStarted
                              )}
                              {statRow(
                                'Games finished',
                                careerPitchingStats.gamesFinished
                              )}
                              {statRow('Saves', careerPitchingStats.saves)}
                              {statRow(
                                'Innings pitched',
                                careerPitchingStats.inningsPitched
                              )}
                              {statRow(
                                'Strikeouts',
                                careerPitchingStats.strikeOuts
                              )}
                              {statRow('Walks', careerPitchingStats.walks)}
                              {statRow('Hits allowed', careerPitchingStats.hits)}
                              {statRow(
                                'Earned runs',
                                careerPitchingStats.earnedRuns
                              )}
                              {statRow('WHIP', careerPitchingStats.whip)}
                              {statRow(
                                'Pitch count',
                                careerPitchingStats.pitchCount
                              )}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      ) : null}
                    </Stack>
                  </CardContent>
                </Card>
              ) : null}

              {!showHittingStats &&
              !showPitchingStats &&
              !careerHittingStats &&
              !careerPitchingStats ? (
                <Card>
                  <CardContent>
                    <Typography color="text.secondary">
                      No statistics available for this player yet.
                    </Typography>
                  </CardContent>
                </Card>
              ) : null}
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}
