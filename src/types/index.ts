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
