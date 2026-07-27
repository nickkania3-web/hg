import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getWatchPartySummary, watchPartyKey } from "@/lib/watchPartySummary";
import type { TeamBarEntryDTO } from "@/lib/types";

// Multi-team version of /api/bars: one row per (team, bar) match, for any
// of the given teamIds, in the given city. Used by the main page's
// multi-team "Choose My Team" filtering, as opposed to /api/bars which
// ranks bars for exactly one team (used by /search).
export async function GET(request: NextRequest) {
  const teamIdsParam = request.nextUrl.searchParams.get("teamIds");
  const city = request.nextUrl.searchParams.get("city");

  if (!teamIdsParam || !city) {
    return Response.json(
      { error: "teamIds and city are required" },
      { status: 400 }
    );
  }

  const teamIds = teamIdsParam.split(",").filter(Boolean);
  if (teamIds.length === 0) {
    return Response.json([]);
  }

  const links = await prisma.teamBarLink.findMany({
    where: {
      teamId: { in: teamIds },
      bar: { city: { equals: city, mode: "insensitive" } },
    },
    include: { team: true, bar: true },
    orderBy: [{ verificationCount: "desc" }, { bar: { name: "asc" } }],
  });

  const wpSummary = await getWatchPartySummary(
    links.map((l) => ({ teamId: l.teamId, barId: l.barId }))
  );

  const dto: TeamBarEntryDTO[] = links.map((link) => {
    const counts = wpSummary.get(watchPartyKey(link.teamId, link.barId));
    return {
      id: link.bar.id,
      name: link.bar.name,
      address: link.bar.address,
      city: link.bar.city,
      lat: link.bar.lat,
      lng: link.bar.lng,
      tvCount: link.bar.tvCount,
      soundPolicy: link.bar.soundPolicy,
      capacity: link.bar.capacity,
      verificationCount: link.verificationCount,
      upcomingWatchPartyCount: counts?.upcoming ?? 0,
      pastWatchPartyCount: counts?.past ?? 0,
      teamId: link.team.id,
      teamName: link.team.name,
      sport: link.team.sport,
    };
  });

  return Response.json(dto);
}
