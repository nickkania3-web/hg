import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import type { AttendeeDTO, WatchPartyDetailDTO } from "@/lib/types";

const ATTENDEE_LIST_THRESHOLD = 20;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const deviceId = request.nextUrl.searchParams.get("deviceId");

  const party = await prisma.watchParty.findUnique({
    where: { id },
    include: {
      team: { select: { id: true, name: true, sport: true } },
      bar: { select: { id: true, name: true, address: true } },
      createdBy: { select: { id: true, displayName: true } },
      rsvps: { include: { fan: { select: { id: true, displayName: true } } } },
    },
  });

  if (!party) {
    return Response.json({ error: "watch party not found" }, { status: 404 });
  }

  const now = new Date();
  const isPast = party.dateTime < now;

  let viewerFanId: string | null = null;
  if (deviceId) {
    const fan = await prisma.fan.findUnique({ where: { deviceId } });
    viewerFanId = fan?.id ?? null;
  }

  const attendees: AttendeeDTO[] =
    party.rsvps.length <= ATTENDEE_LIST_THRESHOLD
      ? party.rsvps.map((r) => ({
          fanId: r.fan.id,
          name: r.fan.displayName || "A HomeGame fan",
          isHost: r.fan.id === party.createdByFanId,
        }))
      : [];

  const dto: WatchPartyDetailDTO = {
    id: party.id,
    teamId: party.team.id,
    teamName: party.team.name,
    sport: party.team.sport,
    barId: party.bar.id,
    barName: party.bar.name,
    barAddress: party.bar.address,
    city: party.city,
    dateTime: party.dateTime.toISOString(),
    note: party.note,
    hostName: party.createdBy.displayName || "A HomeGame fan",
    isPast,
    rsvpCount: party.rsvps.length,
    isRsvpd: viewerFanId ? party.rsvps.some((r) => r.fanId === viewerFanId) : false,
    isHostedBySelf: viewerFanId === party.createdByFanId,
    attendees,
  };

  return Response.json(dto);
}
