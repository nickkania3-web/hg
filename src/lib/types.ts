export interface TeamDTO {
  id: string;
  name: string;
  sport: string;
  league: string;
}

export interface RankedBarDTO {
  id: string;
  name: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  tvCount: number | null;
  soundPolicy: string | null;
  capacity: number | null;
  verificationCount: number;
}

export interface AdminSummaryRow {
  teamId: string;
  teamName: string;
  sport: string;
  league: string;
  verificationCount: number;
}

export interface FavoriteBarDTO {
  id: string;
  name: string;
  address: string;
  city: string;
  favoritedAt: string;
}

export interface VisitedBarDTO {
  barId: string;
  barName: string;
  visitCount: number;
  lastVisitedAt: string;
}

export interface VisitedTeamGroupDTO {
  teamId: string;
  teamName: string;
  sport: string;
  league: string;
  bars: VisitedBarDTO[];
}

export interface ProfileStatsDTO {
  totalVerifications: number;
  teamsFollowedCount: number;
  mostVisitedBar: { barId: string; barName: string; visitCount: number } | null;
}

export interface ProfileDTO {
  displayName: string | null;
  teams: TeamDTO[];
  favoriteBars: FavoriteBarDTO[];
  visited: VisitedTeamGroupDTO[];
  stats: ProfileStatsDTO;
}
