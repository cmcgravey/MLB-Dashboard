import type { Game, Player, HittingStats, TeamStanding } from '@/types';

const BASE_URL = 'https://statsapi.mlb.com/api/v1';
const PHILLIES_TEAM_ID = 143;

/**
 * Fetch recent Phillies games
 * Regular season started March 26, 2026
 * @returns Array of recent games
 */
export async function getRecentPhilliesGames(): Promise<Game[]> {
  try {
    // Regular season start date
    const REGULAR_SEASON_START = new Date('2026-03-26');

    // Calculate date range (last 30 days, but not before regular season start)
    const endDate = new Date();
    const thirtyDaysAgo = new Date(endDate);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Use the later of: 30 days ago or regular season start
    const startDate = thirtyDaysAgo > REGULAR_SEASON_START 
      ? thirtyDaysAgo 
      : REGULAR_SEASON_START;

    const formatDate = (date: Date) => date.toISOString().split('T')[0];
    const startDateStr = formatDate(startDate);
    const endDateStr = formatDate(endDate);

    const url = `${BASE_URL}/schedule?sportId=1&teamId=${PHILLIES_TEAM_ID}&startDate=${startDateStr}&endDate=${endDateStr}`;
    
    const response = await fetch(url, {
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch games: ${response.statusText}`);
    }

    const data = await response.json();
    const games: Game[] = [];

    // Flatten the nested structure
    if (data.dates && Array.isArray(data.dates)) {
      for (const dateEntry of data.dates) {
        if (dateEntry.games && Array.isArray(dateEntry.games)) {
          for (const game of dateEntry.games) {
            games.push({
              id: game.gamePk,
              date: game.gameDate,
              homeTeam: game.teams.home.team.name,
              awayTeam: game.teams.away.team.name,
              homeScore: game.teams.home.score,
              awayScore: game.teams.away.score,
              status: game.status.detailedState,
            });
          }
        }
      }
    }

    return games;
  } catch (error) {
    console.error('Error fetching Phillies games:', error);
    throw error;
  }
}

/**
 * Fetch Phillies team roster
 * @returns Array of players
 */
export async function getPhilliesRoster(): Promise<Player[]> {
  try {
    const url = `${BASE_URL}/teams/${PHILLIES_TEAM_ID}/roster`;
    
    const response = await fetch(url, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch roster: ${response.statusText}`);
    }

    const data = await response.json();
    const players: Player[] = [];

    // Extract player data from roster
    if (data.roster && Array.isArray(data.roster)) {
      for (const entry of data.roster) {
        players.push({
          id: entry.person.id,
          name: entry.person.fullName,
          position: entry.position.abbreviation,
        });
      }
    }

    return players;
  } catch (error) {
    console.error('Error fetching Phillies roster:', error);
    throw error;
  }
}

/**
 * Fetch hitting stats for a specific player
 * @param playerId - MLB player ID
 * @returns Player hitting statistics
 */
export async function getPlayerHittingStats(
  playerId: number
): Promise<HittingStats> {
  try {
    const url = `${BASE_URL}/people/${playerId}/stats?stats=season&group=hitting`;
    
    const response = await fetch(url, {
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch player stats: ${response.statusText}`
      );
    }

    const data = await response.json();

    // Extract hitting stats from the response
    if (data.stats && Array.isArray(data.stats) && data.stats.length > 0) {
      const stat = data.stats[0]?.splits?.[0]?.stat;

      if (stat) {
        return {
          avg: stat.avg || '.000',
          homeRuns: stat.homeRuns || 0,
          rbi: stat.rbi || 0,
          ops: stat.ops || '.000',
        };
      }
    }

    // Return default stats if not found
    return {
      avg: '.000',
      homeRuns: 0,
      rbi: 0,
      ops: '.000',
    };
  } catch (error) {
    console.error(`Error fetching stats for player ${playerId}:`, error);
    throw error;
  }
}

/**
 * Fetch Phillies standings and record
 * @returns Phillies team standing information
 */
export async function getPhilliesStandings(): Promise<TeamStanding> {
  try {
    const url = `${BASE_URL}/standings?leagueId=104`;

    const response = await fetch(url, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch standings: ${response.statusText}`);
    }

    const data = await response.json();

    // Find Phillies in the standings
    if (data.records && Array.isArray(data.records)) {
      for (const record of data.records) {
        const teamRecords = record.teamRecords || [];
        for (const teamRecord of teamRecords) {
          const team = teamRecord.team || {};
          if (team.id === PHILLIES_TEAM_ID) {
            return {
              teamName: team.name,
              wins: teamRecord.wins,
              losses: teamRecord.losses,
              winPct: teamRecord.winningPercentage,
              divisionRank: parseInt(teamRecord.divisionRank, 10),
              gamesBack: teamRecord.gamesBack,
              streak: teamRecord.streak?.streakCode || '-',
            };
          }
        }
      }
    }

    // Return default if not found
    throw new Error('Phillies not found in standings');
  } catch (error) {
    console.error('Error fetching Phillies standings:', error);
    throw error;
  }
}
