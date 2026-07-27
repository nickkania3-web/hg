export interface TeamDTO {
  id: string;
  name: string;
  sport: string;
  league: string;
  logoUrl: string;
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
  upcomingWatchPartyCount: number;
  pastWatchPartyCount: number;
}

// One (team, bar) match for a multi-team filtered view — a bar linked to
// several selected teams appears once per team, not merged into one row.
export interface TeamBarEntryDTO extends RankedBarDTO {
  teamId: string;
  teamName: string;
  sport: string;
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

// One watch party in the team+bar-scoped modal list (BarCard's indicator).
export interface WatchPartyForBarEntryDTO {
  id: string;
  dateTime: string;
  note: string | null;
  rsvpCount: number;
  isRsvpd: boolean;
  isPast: boolean;
  isHostedBySelf: boolean;
}

export interface FeedEntryDTO {
  id: string;
  name: string;
  teamName: string;
  sport: string;
  barName: string;
  createdAt: string;
}

export interface FeedPageDTO {
  entries: FeedEntryDTO[];
  nextCursor: string | null;
}
