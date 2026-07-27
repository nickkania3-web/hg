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

export interface BarDirectoryItemDTO {
  id: string;
  name: string;
  address: string;
}

export interface WatchPartyListItemDTO {
  id: string;
  teamName: string;
  sport: string;
  barName: string;
  city: string;
  dateTime: string;
  rsvpCount: number;
  isPast: boolean;
}

export interface AttendeeDTO {
  fanId: string;
  name: string;
  isHost: boolean;
}

export interface WatchPartyDetailDTO {
  id: string;
  teamId: string;
  teamName: string;
  sport: string;
  barId: string;
  barName: string;
  barAddress: string;
  city: string;
  dateTime: string;
  note: string | null;
  hostName: string;
  isPast: boolean;
  rsvpCount: number;
  isRsvpd: boolean;
  isHostedBySelf: boolean;
  // Populated when rsvpCount is small enough to list by name; otherwise empty
  // and the UI falls back to showing just rsvpCount.
  attendees: AttendeeDTO[];
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
