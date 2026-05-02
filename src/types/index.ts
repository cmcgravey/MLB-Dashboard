export interface Game {
  id: number;
  date: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  status: string;
  gameLink: string; // API link from schedule response
  listKey: string; // Unique key for rendering schedule entries
}

export interface Player {
  id: number;
  name: string;
  position: string;
  jerseyNumber?: string;
  status?: string;
}

export interface PlayerDetails {
  id: number;
  fullName: string;
  firstName: string;
  lastName: string;
  jerseyNumber?: string;
  primaryPosition: string;
  currentTeam: string;
  bats: string;
  throws: string;
  height: string;
  weight: number;
  birthDate: string;
  birthCity: string;
  birthStateProvince?: string;
  birthCountry: string;
  active: boolean;
  rosterStatus: string;
  mlbDebutDate: string;
  currentAge: number;
}

export interface HittingStats {
  avg: string;
  homeRuns: number;
  rbi: number;
  ops: string;
  gamesPlayed?: number;
  atBats?: number;
  runs?: number;
  hits?: number;
  doubles?: number;
  triples?: number;
  walks?: number;
  strikeOuts?: number;
  stolenBases?: number;
  obp?: string;
  slg?: string;
  plateAppearances?: number;
  totalBases?: number;
  babip?: string;
  groundOuts?: number;
  airOuts?: number;
  groundOutsToAirouts?: string;
  caughtStealing?: number;
  stolenBasePercentage?: string;
}

export interface PitchingStats {
  gamesPlayed?: number;
  wins?: number;
  losses?: number;
  era?: string;
  gamesStarted?: number;
  gamesFinished?: number;
  saves?: number;
  inningsPitched?: string;
  strikeOuts?: number;
  walks?: number;
  hits?: number;
  earnedRuns?: number;
  whip?: string;
  pitchCount?: number;
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
