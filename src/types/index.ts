export interface Game {
  id: number;
  date: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  status: string;
  gameLink: string; // API link from schedule response
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

export interface InningRunData {
  runs: number;
  hits: number;
  errors: number;
  leftOnBase: number;
}

export interface InningData {
  num: number;
  ordinalNum: string;
  away: InningRunData;
  home: InningRunData;
}

export interface LineScore {
  currentInning: number;
  inningState: string;
  innings: InningData[];
}

export interface GameBoxScore {
  homeTeam: string;
  awayTeam: string;
  homePlayers: PlayerStat[];
  awayPlayers: PlayerStat[];
  linescore?: LineScore;
}
