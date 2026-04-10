'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Tabs,
  Tab,
  Alert,
} from '@mui/material';
import { getRecentPhilliesGames, getPhilliesStandings, getPhilliesRoster } from '@/lib/mlb';
import type { Game, TeamStanding, Player } from '@/types';
import { TeamStandingsHeader } from './Header/TeamStandingsHeader';
import { RecentGamesTab } from './Tabs/RecentGamesTab';
import { RosterTab } from './Tabs/RosterTab';
import { LoadingState } from './Common/LoadingState';

export function PhilliesHome() {
  const [games, setGames] = useState<Game[]>([]);
  const [standing, setStanding] = useState<TeamStanding | null>(null);
  const [roster, setRoster] = useState<Player[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [recentGames, philliesStanding, philliesRoster] = await Promise.all([
          getRecentPhilliesGames(),
          getPhilliesStandings(),
          getPhilliesRoster(),
        ]);
        setGames(recentGames);
        setStanding(philliesStanding);
        setRoster(philliesRoster);
        setError(null);
      } catch (err) {
        setError('Failed to load data. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 6 }}>
        <TeamStandingsHeader standing={standing} />

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
          <Tabs
            value={activeTab}
            onChange={(event, newValue) => setActiveTab(newValue)}
            aria-label="team tabs"
          >
            <Tab label="Recent Games" id="tab-0" />
            <Tab label="Roster" id="tab-1" />
          </Tabs>
        </Box>

        {loading && <LoadingState />}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {!loading && activeTab === 0 && (
          <RecentGamesTab games={games} isLoading={loading} />
        )}

        {!loading && activeTab === 1 && (
          <RosterTab players={roster} isLoading={loading} />
        )}
      </Box>
    </Container>
  );
}
