import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getWatchPartySummary, watchPartyKey } from "@/lib/watchPartySummary";
import type { RankedBarDTO } from "@/lib/types";

export async function GET(request: NextRequest) {
  const teamId = request.nextUrl.searchParams.get("teamId");
  const city = request.nextUrl.searchParams.get("city");

  if (!teamId) {
    return Response.json({ error: "teamId is required" }, { status: 400 });
  }

  const links = await prisma.teamBarLink.findMany({
    where: {
      teamId,
      ...(city
        ? { bar: { city: { equals: city, mode: "insensitive" } } }
        : {}),
    },
    include: { bar: true },
    orderBy: [{ verificationCount: "desc" }, { bar: { name: "asc" } }],
  });

  const wpSummary = await getWatchPartySummary(
    links.map((l) => ({ teamId: l.teamId, barId: l.barId }))
  );

  const dto: RankedBarDTO[] = links.map((link) => {
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
    };
  });

  return Response.json(dto);
}
