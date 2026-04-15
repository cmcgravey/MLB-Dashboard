export interface Game {
  id: number;
  date: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  status: string;
}

export interface Player {
  id: number;
  name: string;
  position: string;
}

export interface HittingStats {
  avg: string;
  homeRuns: number;
  rbi: number;
  ops: string;
}

export interface TeamStanding {
  teamName: string;
  wins: number;
  losses: number;
  winPct: string;
  divisionRank: number;
  gamesBack: string;
  streak: string;
}

export interface PlayerStat {
  name: string;
  battingOrder?: number;
  isPinchHitter?: boolean;
  atBats?: number;
  hits?: number;
  walks?: number;
  homeRuns?: number;
  strikeOuts?: number;
  rbi?: number;
  inningsPitched?: string;
  earnedRuns?: number;
  pitchingHits?: number;
  pitchingWalks?: number;
  pitchingRuns?: number;
  pitchingHomeRuns?: number;
  pitchingOrder?: number;
}

export interface GameBoxScore {
  homeTeam: string;
  awayTeam: string;
  homePlayers: PlayerStat[];
  awayPlayers: PlayerStat[];
}
