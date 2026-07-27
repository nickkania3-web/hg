import { prisma } from "@/lib/db";
import { formatPartyDateTime } from "@/lib/format";
import type { FeaturedListItemDTO, FeaturedListKey } from "@/lib/types";

// "Top N Strongest {Sport} Presence" — teams ranked by total verification
// count (via the TeamBarLink rollup, not raw Verification rows) for a
// specific sport, within the city.
async function basketballPresence(
  city: string,
  limit: number
): Promise<FeaturedListItemDTO[]> {
  const grouped = await prisma.teamBarLink.groupBy({
    by: ["teamId"],
    where: {
      bar: { city: { equals: city, mode: "insensitive" } },
      team: { sport: "Basketball" },
    },
    _sum: { verificationCount: true },
    orderBy: { _sum: { verificationCount: "desc" } },
    take: limit,
  });

  const teams = await prisma.team.findMany({
    where: { id: { in: grouped.map((g) => g.teamId) } },
  });
  const teamById = new Map(teams.map((t) => [t.id, t]));

  return grouped
    .map((g) => {
      const team = teamById.get(g.teamId);
      const count = g._sum.verificationCount ?? 0;
      if (!team || count === 0) return null;
      return {
        id: team.id,
        primaryText: team.name,
        secondaryText: `${count} check-in${count === 1 ? "" : "s"}`,
        count,
      };
    })
    .filter((x): x is FeaturedListItemDTO => x !== null);
}

// "Top N Most Popular Sports Bars" — bars ranked by total verification
// count across all teams, within the city.
async function popularBars(
  city: string,
  limit: number
): Promise<FeaturedListItemDTO[]> {
  const grouped = await prisma.teamBarLink.groupBy({
    by: ["barId"],
    where: { bar: { city: { equals: city, mode: "insensitive" } } },
    _sum: { verificationCount: true },
    orderBy: { _sum: { verificationCount: "desc" } },
    take: limit,
  });

  const bars = await prisma.bar.findMany({
    where: { id: { in: grouped.map((g) => g.barId) } },
  });
  const barById = new Map(bars.map((b) => [b.id, b]));

  return grouped
    .map((g) => {
      const bar = barById.get(g.barId);
      const count = g._sum.verificationCount ?? 0;
      if (!bar || count === 0) return null;
      return {
        id: bar.id,
        primaryText: bar.name,
        secondaryText: `${count} check-in${count === 1 ? "" : "s"}`,
        count,
      };
    })
    .filter((x): x is FeaturedListItemDTO => x !== null);
}

// "Most Followed Teams" — teams ranked by total FanTeamFollow count.
// Neither Fan nor Team has a city, so "within the fan's city" is applied
// by restricting candidate teams to ones with an actual bar presence in
// that city (a TeamBarLink row there) — the only city-relevant reading
// the schema supports — then ranking those by follower count.
async function mostFollowedTeams(
  city: string,
  limit: number
): Promise<FeaturedListItemDTO[]> {
  const teamsInCity = await prisma.teamBarLink.findMany({
    where: { bar: { city: { equals: city, mode: "insensitive" } } },
    select: { teamId: true },
    distinct: ["teamId"],
  });
  const candidateIds = teamsInCity.map((t) => t.teamId);
  if (candidateIds.length === 0) return [];

  const grouped = await prisma.fanTeamFollow.groupBy({
    by: ["teamId"],
    where: { teamId: { in: candidateIds } },
    _count: { teamId: true },
    orderBy: { _count: { teamId: "desc" } },
    take: limit,
  });

  const teams = await prisma.team.findMany({
    where: { id: { in: grouped.map((g) => g.teamId) } },
  });
  const teamById = new Map(teams.map((t) => [t.id, t]));

  return grouped
    .map((g) => {
      const team = teamById.get(g.teamId);
      const count = g._count.teamId;
      if (!team || count === 0) return null;
      return {
        id: team.id,
        primaryText: team.name,
        secondaryText: `${count} fan${count === 1 ? "" : "s"}`,
        count,
      };
    })
    .filter((x): x is FeaturedListItemDTO => x !== null);
}

// "Trending Fan Spots This Week" — bars ranked by raw Verification volume
// in the last 7 days, within the city. Not a week-over-week delta against
// a prior period, just this window's count.
async function trendingBars(
  city: string,
  limit: number
): Promise<FeaturedListItemDTO[]> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const grouped = await prisma.verification.groupBy({
    by: ["barId"],
    where: {
      createdAt: { gte: sevenDaysAgo },
      bar: { city: { equals: city, mode: "insensitive" } },
    },
    _count: { barId: true },
    orderBy: { _count: { barId: "desc" } },
    take: limit,
  });

  const bars = await prisma.bar.findMany({
    where: { id: { in: grouped.map((g) => g.barId) } },
  });
  const barById = new Map(bars.map((b) => [b.id, b]));

  return grouped
    .map((g) => {
      const bar = barById.get(g.barId);
      const count = g._count.barId;
      if (!bar || count === 0) return null;
      return {
        id: bar.id,
        primaryText: bar.name,
        secondaryText: `${count} check-in${count === 1 ? "" : "s"} this week`,
        count,
      };
    })
    .filter((x): x is FeaturedListItemDTO => x !== null);
}

// "Busiest Watch Parties This Week" — upcoming watch parties happening in
// the next 7 days, within the city, ranked by RSVP count.
async function busiestWatchParties(
  city: string,
  limit: number
): Promise<FeaturedListItemDTO[]> {
  const now = new Date();
  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const parties = await prisma.watchParty.findMany({
    where: {
      dateTime: { gte: now, lte: weekFromNow },
      bar: { city: { equals: city, mode: "insensitive" } },
    },
    include: {
      team: { select: { name: true } },
      bar: { select: { name: true } },
      _count: { select: { rsvps: true } },
    },
    orderBy: { rsvps: { _count: "desc" } },
    take: limit,
  });

  return parties
    .filter((p) => p._count.rsvps > 0)
    .map((p) => ({
      id: p.id,
      primaryText: `${p.team.name} at ${p.bar.name}`,
      secondaryText: `${p._count.rsvps} RSVP${p._count.rsvps === 1 ? "" : "s"} · ${formatPartyDateTime(p.dateTime.toISOString())}`,
      count: p._count.rsvps,
    }));
}

export const FEATURED_LISTS: {
  key: FeaturedListKey;
  title: string;
  fullLimit: number;
  query: (city: string, limit: number) => Promise<FeaturedListItemDTO[]>;
}[] = [
  {
    key: "basketball-presence",
    title: "Strongest Basketball Presence",
    fullLimit: 10,
    query: basketballPresence,
  },
  {
    key: "popular-bars",
    title: "Most Popular Sports Bars",
    fullLimit: 5,
    query: popularBars,
  },
  {
    key: "most-followed-teams",
    title: "Most Followed Teams",
    fullLimit: 10,
    query: mostFollowedTeams,
  },
  {
    key: "trending-bars",
    title: "Trending Fan Spots This Week",
    fullLimit: 5,
    query: trendingBars,
  },
  {
    key: "busiest-watch-parties",
    title: "Busiest Watch Parties This Week",
    fullLimit: 5,
    query: busiestWatchParties,
  },
];
