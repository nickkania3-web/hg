import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import type { WatchPartyForBarEntryDTO } from "@/lib/types";

// All watch parties for one specific (team, bar) pair — powers the modal
// opened from a bar card's watch-party indicator. Upcoming first (soonest),
// then past (most recent first).
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const teamId = params.get("teamId");
  const barId = params.get("barId");
  const deviceId = params.get("deviceId");

  if (!teamId || !barId) {
    return Response.json(
      { error: "teamId and barId are required" },
      { status: 400 }
    );
  }

  let viewerFanId: string | null = null;
  if (deviceId) {
    const fan = await prisma.fan.findUnique({ where: { deviceId } });
    viewerFanId = fan?.id ?? null;
  }

  const parties = await prisma.watchParty.findMany({
    where: { teamId, barId },
    include: { rsvps: { select: { fanId: true } } },
  });

  const now = new Date();

  const upcoming = parties
    .filter((p) => p.dateTime >= now)
    .sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());
  const past = parties
    .filter((p) => p.dateTime < now)
    .sort((a, b) => b.dateTime.getTime() - a.dateTime.getTime());

  const toDTO = (p: (typeof parties)[number]): WatchPartyForBarEntryDTO => ({
    id: p.id,
    dateTime: p.dateTime.toISOString(),
    note: p.note,
    rsvpCount: p.rsvps.length,
    isRsvpd: viewerFanId ? p.rsvps.some((r) => r.fanId === viewerFanId) : false,
    isPast: p.dateTime < now,
    isHostedBySelf: viewerFanId === p.createdByFanId,
  });

  const dto: WatchPartyForBarEntryDTO[] = [...upcoming, ...past].map(toDTO);

  return Response.json(dto);
}
