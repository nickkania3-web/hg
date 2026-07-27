import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import type { ProfileDTO, VisitedTeamGroupDTO } from "@/lib/types";

const EMPTY_PROFILE: ProfileDTO = {
  displayName: null,
  teams: [],
  favoriteBars: [],
  visited: [],
  stats: { totalVerifications: 0, teamsFollowedCount: 0, mostVisitedBar: null },
};

export async function GET(request: NextRequest) {
  const deviceId = request.nextUrl.searchParams.get("deviceId");
  if (!deviceId) {
    return Response.json({ error: "deviceId is required" }, { status: 400 });
  }

  const fan = await prisma.fan.findUnique({
    where: { deviceId },
    include: {
      teamFollows: { include: { team: true }, orderBy: { createdAt: "desc" } },
      barFavorites: { include: { bar: true }, orderBy: { createdAt: "desc" } },
      verifications: { include: { team: true, bar: true } },
    },
  });

  if (!fan) {
    return Response.json(EMPTY_PROFILE);
  }

  const teams = fan.teamFollows.map((f) => ({
    id: f.team.id,
    name: f.team.name,
    sport: f.team.sport,
    league: f.team.league,
  }));

  const favoriteBars = fan.barFavorites.map((f) => ({
    id: f.bar.id,
    name: f.bar.name,
    address: f.bar.address,
    city: f.bar.city,
    favoritedAt: f.createdAt.toISOString(),
  }));

  // Group verifications by team, then by bar within each team.
  const visitedByTeam = new Map<
    string,
    { team: (typeof fan.verifications)[number]["team"]; bars: Map<string, { bar: (typeof fan.verifications)[number]["bar"]; count: number; lastVisitedAt: Date }> }
  >();

  const barVisitCounts = new Map<string, { bar: (typeof fan.verifications)[number]["bar"]; count: number }>();

  for (const v of fan.verifications) {
    if (!visitedByTeam.has(v.teamId)) {
      visitedByTeam.set(v.teamId, { team: v.team, bars: new Map() });
    }
    const teamGroup = visitedByTeam.get(v.teamId)!;
    const existingBar = teamGroup.bars.get(v.barId);
    if (existingBar) {
      existingBar.count += 1;
      if (v.createdAt > existingBar.lastVisitedAt) {
        existingBar.lastVisitedAt = v.createdAt;
      }
    } else {
      teamGroup.bars.set(v.barId, { bar: v.bar, count: 1, lastVisitedAt: v.createdAt });
    }

    const overall = barVisitCounts.get(v.barId);
    if (overall) {
      overall.count += 1;
    } else {
      barVisitCounts.set(v.barId, { bar: v.bar, count: 1 });
    }
  }

  const visited: VisitedTeamGroupDTO[] = Array.from(visitedByTeam.values())
    .map(({ team, bars }) => ({
      teamId: team.id,
      teamName: team.name,
      sport: team.sport,
      league: team.league,
      bars: Array.from(bars.values())
        .map((b) => ({
          barId: b.bar.id,
          barName: b.bar.name,
          visitCount: b.count,
          lastVisitedAt: b.lastVisitedAt.toISOString(),
        }))
        .sort((a, b) => b.visitCount - a.visitCount),
    }))
    .sort((a, b) => a.teamName.localeCompare(b.teamName));

  let mostVisitedBar: ProfileDTO["stats"]["mostVisitedBar"] = null;
  for (const { bar, count } of barVisitCounts.values()) {
    if (!mostVisitedBar || count > mostVisitedBar.visitCount) {
      mostVisitedBar = { barId: bar.id, barName: bar.name, visitCount: count };
    }
  }

  const profile: ProfileDTO = {
    displayName: fan.displayName,
    teams,
    favoriteBars,
    visited,
    stats: {
      totalVerifications: fan.verifications.length,
      teamsFollowedCount: teams.length,
      mostVisitedBar,
    },
  };

  return Response.json(profile);
}
