import type { Game, Player, PlayerDetails, HittingStats, PitchingStats, TeamStanding, GameBoxScore, PlayerStat, LineScore, InningData } from '@/types';

const BASE_URL = 'https://statsapi.mlb.com/api/v1';
const PHILLIES_TEAM_ID = 143;

// API Response Types
interface PlayerBattingStats {
  hits: number;
  atBats: number;
  walks: number;
  homeRuns: number;
  strikeOuts: number;
  rbi: number;
}

interface PlayerPitchingStats {
  inningsPitched: number;
  hits: number;
  runs: number;
  earnedRuns: number;
  walks: number;
  strikeOuts: number;
  homeRuns: number;
}

interface PlayerStatsData {
  batting?: PlayerBattingStats;
  pitching?: PlayerPitchingStats;
}

interface PlayerData {
  person: {
    fullName: string;
  };
  battingOrder?: string;
  gameStatus?: {
    isCurrentBatter?: boolean;
    isCurrentPitcher?: boolean;
  };
  stats: PlayerStatsData;
}

interface BoxScoreResponse {
  liveData: {
    boxscore: {
      teams: {
        home: {
          team: {
            name: string;
          };
          players: Record<string, PlayerData>;
        };
        away: {
          team: {
            name: string;
          };
          players: Record<string, PlayerData>;
        };
      };
    };
    linescore: {
      currentInning: number;
      inningState: string;
      innings: InningData[];
      teams: {
        home: {
          runs: number;
        };
        away: {
          runs: number;
        };
      };
    };
  };
}

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

    const isPostponed = (status: string) =>
      status.toLowerCase().includes('postponed');

    // Flatten the nested structure and preserve distinct schedule entries
    if (data.dates && Array.isArray(data.dates)) {
      for (const dateEntry of data.dates) {
        if (dateEntry.games && Array.isArray(dateEntry.games)) {
          for (const game of dateEntry.games) {
            const status = game.status?.detailedState ?? '';
            if (isPostponed(status)) {
              continue;
            }

            games.push({
              id: game.gamePk,
              date: game.gameDate,
              homeTeam: game.teams.home.team.name,
              awayTeam: game.teams.away.team.name,
              homeScore: game.teams.home.score,
              awayScore: game.teams.away.score,
              status,
              gameLink: game.link,
              listKey: `${game.gamePk}-${game.gameDate}`,
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
 * Fetch game box score and linescore using the game feed link from schedule
 * @param gameLink The game feed link from schedule response (e.g., "/api/v1.1/game/823483/feed/live")
 * @returns Simplified box score with team names, player stats, and linescore
 */
export async function getGameBoxScore(gameLink: string): Promise<GameBoxScore> {
  try {
    const url = `https://statsapi.mlb.com${gameLink}`;
    
    const response = await fetch(url, {
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch game data: ${response.statusText}`);
    }

    const data = await response.json() as BoxScoreResponse;

    const extractPlayerStats = (teamPlayers: Record<string, PlayerData>): PlayerStat[] => {
      const stats: PlayerStat[] = [];
      let pitcherSequence = 0;

      for (const playerId in teamPlayers) {
        const player = teamPlayers[playerId];
        const playerName = player.person?.fullName;
        
        if (!playerName) continue;

        const stat: PlayerStat = { name: playerName };

        // Extract batting order if available
        if (player.battingOrder) {
          const battingOrderNum = parseInt(player.battingOrder, 10);
          stat.battingOrder = battingOrderNum;
          // Check if player is a pinch hitter (ending in 01, e.g., 401 for pinch hitter in 4th spot)
          stat.isPinchHitter = battingOrderNum % 100 === 1;
        }

        // Extract batting stats
        if (player.stats?.batting) {
          const batting = player.stats.batting;
          const hits = batting.hits ?? 0;
          const atBats = batting.atBats ?? 0;
          const walks = batting.walks ?? 0;
          const homeRuns = batting.homeRuns ?? 0;
          const strikeOuts = batting.strikeOuts ?? 0;
          const rbi = batting.rbi ?? 0;

          // Only add batting stats if player has at least some activity
          if (hits > 0 || atBats > 0 || walks > 0 || homeRuns > 0 || strikeOuts > 0 || rbi > 0) {
            stat.hits = hits;
            stat.atBats = atBats;
            stat.walks = walks;
            stat.homeRuns = homeRuns;
            stat.strikeOuts = strikeOuts;
            stat.rbi = rbi;
          }
        }

        // Extract pitching stats
        if (player.stats?.pitching) {
          const pitching = player.stats.pitching;
          const inningsPitched = pitching.inningsPitched;
          const pitchingHits = pitching.hits ?? 0;
          const runs = pitching.runs ?? 0;
          const earnedRuns = pitching.earnedRuns ?? 0;
          const pitchingWalks = pitching.walks ?? 0;
          const strikeOuts = pitching.strikeOuts ?? 0;
          const pitchingHomeRuns = pitching.homeRuns ?? 0;

          // Only add pitching stats if pitcher pitched
          if (inningsPitched !== undefined && inningsPitched > 0) {
            stat.inningsPitched = inningsPitched.toString();
            stat.pitchingHits = pitchingHits;
            stat.pitchingRuns = runs;
            stat.earnedRuns = earnedRuns;
            stat.pitchingWalks = pitchingWalks;
            stat.strikeOuts = strikeOuts;
            stat.pitchingHomeRuns = pitchingHomeRuns;
            stat.pitchingOrder = pitcherSequence;
            pitcherSequence += 1;
          }
        }

        // Only include player if they have at least one stat
        if (Object.keys(stat).length > 1) {
          stats.push(stat);
        }
      }

      return stats;
    };

    const homeTeam = data.liveData?.boxscore?.teams?.home?.team?.name ?? 'Home Team';
    const awayTeam = data.liveData?.boxscore?.teams?.away?.team?.name ?? 'Away Team';
    const homePlayers = extractPlayerStats(data.liveData?.boxscore?.teams?.home?.players ?? {});
    const awayPlayers = extractPlayerStats(data.liveData?.boxscore?.teams?.away?.players ?? {});

    // Extract linescore for inning-by-inning display
    let linescore: LineScore | undefined;
    const linescoreData = data.liveData?.linescore;
    if (linescoreData?.innings && Array.isArray(linescoreData.innings)) {
      linescore = {
        currentInning: linescoreData.currentInning ?? 0,
        inningState: linescoreData.inningState ?? '',
        innings: linescoreData.innings,
      };
    }

    return {
      homeTeam,
      awayTeam,
      homePlayers,
      awayPlayers,
      linescore,
    };
  } catch (error) {
    console.error('Error fetching game data:', error);
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
          jerseyNumber: entry.jerseyNumber,
          status: entry.status?.description,
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
    const stat = data.stats?.[0]?.splits?.[0]?.stat;
    if (stat) {
      return {
        avg: stat.avg || '.000',
        homeRuns: stat.homeRuns ?? 0,
        rbi: stat.rbi ?? 0,
        ops: stat.ops || '.000',
        gamesPlayed: stat.gamesPlayed,
        atBats: stat.atBats,
        runs: stat.runs,
        hits: stat.hits,
        doubles: stat.doubles,
        triples: stat.triples,
        walks: stat.baseOnBalls,
        strikeOuts: stat.strikeOuts,
        stolenBases: stat.stolenBases,
        obp: stat.obp,
        slg: stat.slg,
        plateAppearances: stat.plateAppearances,
        totalBases: stat.totalBases,
        babip: stat.babip,
        groundOuts: stat.groundOuts,
        airOuts: stat.airOuts,
        groundOutsToAirouts: stat.groundOutsToAirouts,
        caughtStealing: stat.caughtStealing,
        stolenBasePercentage: stat.stolenBasePercentage,
      };
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

export async function getPlayerCareerHittingStats(
  playerId: number
): Promise<HittingStats> {
  try {
    const url = `${BASE_URL}/people/${playerId}/stats?stats=career&group=hitting`;
    
    const response = await fetch(url, {
      next: { revalidate: 3600 }, // Cache for 1 hour - career stats don't change often
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch career stats: ${response.statusText}`
      );
    }

    const data = await response.json();
    const stat = data.stats?.[0]?.splits?.[0]?.stat;

    if (stat) {
      return {
        avg: stat.avg || '.000',
        homeRuns: stat.homeRuns ?? 0,
        rbi: stat.rbi ?? 0,
        ops: stat.ops || '.000',
        gamesPlayed: stat.gamesPlayed,
        atBats: stat.atBats,
        runs: stat.runs,
        hits: stat.hits,
        doubles: stat.doubles,
        triples: stat.triples,
        walks: stat.baseOnBalls,
        strikeOuts: stat.strikeOuts,
        stolenBases: stat.stolenBases,
        obp: stat.obp,
        slg: stat.slg,
        plateAppearances: stat.plateAppearances,
        totalBases: stat.totalBases,
        babip: stat.babip,
        groundOuts: stat.groundOuts,
        airOuts: stat.airOuts,
        groundOutsToAirouts: stat.groundOutsToAirouts,
        caughtStealing: stat.caughtStealing,
        stolenBasePercentage: stat.stolenBasePercentage,
      };
    }

    return {
      avg: '.000',
      homeRuns: 0,
      rbi: 0,
      ops: '.000',
    };
  } catch (error) {
    console.error(`Error fetching career hitting stats for player ${playerId}:`, error);
    throw error;
  }
}

export async function getPlayerDetails(
  playerId: number
): Promise<PlayerDetails> {
  try {
    const url = `${BASE_URL}/people/${playerId}`;

    const response = await fetch(url, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch player details: ${response.statusText}`
      );
    }

    const data = await response.json();
    const person = data.people?.[0];

    if (!person) {
      throw new Error(`Player ${playerId} not found`);
    }

    return {
      id: person.id,
      fullName: person.fullName,
      firstName: person.firstName,
      lastName: person.lastName,
      jerseyNumber: person.primaryNumber,
      primaryPosition: person.primaryPosition?.name ?? 'Unknown',
      currentTeam: person.currentTeam?.name ?? 'Philadelphia Phillies',
      bats: person.batSide?.description ?? person.batSide?.code ?? 'N/A',
      throws: person.pitchHand?.description ?? person.pitchHand?.code ?? 'N/A',
      height: person.height ?? 'Unknown',
      weight: person.weight ?? 0,
      birthDate: person.birthDate ?? 'Unknown',
      birthCity: person.birthCity ?? '',
      birthStateProvince: person.birthStateProvince,
      birthCountry: person.birthCountry ?? 'Unknown',
      active: person.active ?? false,
      rosterStatus: person.rosterStatus ?? 'Unknown',
      mlbDebutDate: person.mlbDebutDate ?? 'N/A',
      currentAge: person.currentAge ?? 0,
    };
  } catch (error) {
    console.error(`Error fetching player details for ${playerId}:`, error);
    throw error;
  }
}

export async function getPlayerPitchingStats(
  playerId: number
): Promise<PitchingStats> {
  try {
    const url = `${BASE_URL}/people/${playerId}/stats?stats=season&group=pitching`;
    
    const response = await fetch(url, {
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch player pitching stats: ${response.statusText}`
      );
    }

    const data = await response.json();
    const stat = data.stats?.[0]?.splits?.[0]?.stat;

    if (stat) {
      return {
        gamesPlayed: stat.gamesPlayed ?? 0,
        wins: stat.wins ?? 0,
        losses: stat.losses ?? 0,
        era: stat.era ?? '0.00',
        gamesStarted: stat.gamesStarted ?? 0,
        gamesFinished: stat.gamesFinished ?? 0,
        saves: stat.saves ?? 0,
        inningsPitched: stat.inningsPitched ?? '0.0',
        strikeOuts: stat.strikeOuts ?? 0,
        walks: stat.baseOnBalls ?? 0,
        hits: stat.hits ?? 0,
        earnedRuns: stat.earnedRuns ?? 0,
        whip: stat.whip ?? '0.00',
        pitchCount: stat.numberOfPitches ?? 0,
      };
    }

    return {
      gamesPlayed: 0,
      wins: 0,
      losses: 0,
      era: '0.00',
      gamesStarted: 0,
      gamesFinished: 0,
      saves: 0,
      inningsPitched: '0.0',
      strikeOuts: 0,
      walks: 0,
      hits: 0,
      earnedRuns: 0,
      whip: '0.00',
      pitchCount: 0,
    };
  } catch (error) {
    console.error(`Error fetching pitching stats for player ${playerId}:`, error);
    throw error;
  }
}

export async function getPlayerCareerPitchingStats(
  playerId: number
): Promise<PitchingStats> {
  try {
    const url = `${BASE_URL}/people/${playerId}/stats?stats=career&group=pitching`;
    
    const response = await fetch(url, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch career pitching stats: ${response.statusText}`
      );
    }

    const data = await response.json();
    const stat = data.stats?.[0]?.splits?.[0]?.stat;

    if (stat) {
      return {
        gamesPlayed: stat.gamesPlayed ?? 0,
        wins: stat.wins ?? 0,
        losses: stat.losses ?? 0,
        era: stat.era ?? '0.00',
        gamesStarted: stat.gamesStarted ?? 0,
        gamesFinished: stat.gamesFinished ?? 0,
        saves: stat.saves ?? 0,
        inningsPitched: stat.inningsPitched ?? '0.0',
        strikeOuts: stat.strikeOuts ?? 0,
        walks: stat.baseOnBalls ?? 0,
        hits: stat.hits ?? 0,
        earnedRuns: stat.earnedRuns ?? 0,
        whip: stat.whip ?? '0.00',
        pitchCount: stat.numberOfPitches ?? 0,
      };
    }

    return {
      gamesPlayed: 0,
      wins: 0,
      losses: 0,
      era: '0.00',
      gamesStarted: 0,
      gamesFinished: 0,
      saves: 0,
      inningsPitched: '0.0',
      strikeOuts: 0,
      walks: 0,
      hits: 0,
      earnedRuns: 0,
      whip: '0.00',
      pitchCount: 0,
    };
  } catch (error) {
    console.error(`Error fetching career pitching stats for player ${playerId}:`, error);
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
