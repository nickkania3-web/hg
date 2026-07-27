import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db";

interface RsvpBody {
  deviceId?: string;
}

async function getUpcomingParty(id: string) {
  const party = await prisma.watchParty.findUnique({ where: { id } });
  if (!party) return { error: "watch party not found" as const, status: 404 as const };
  if (party.dateTime < new Date()) {
    return { error: "RSVPs are closed for past watch parties" as const, status: 400 as const };
  }
  return { party };
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { deviceId } = (await request.json()) as RsvpBody;

  if (!deviceId) {
    return Response.json({ error: "deviceId is required" }, { status: 400 });
  }

  const result = await getUpcomingParty(id);
  if ("error" in result) {
    return Response.json({ error: result.error }, { status: result.status });
  }

  const fan = await prisma.fan.upsert({
    where: { deviceId },
    update: {},
    create: { deviceId },
  });

  await prisma.rSVP.upsert({
    where: { fanId_watchPartyId: { fanId: fan.id, watchPartyId: id } },
    update: {},
    create: { fanId: fan.id, watchPartyId: id },
  });

  const rsvpCount = await prisma.rSVP.count({ where: { watchPartyId: id } });

  return Response.json({ isRsvpd: true, rsvpCount }, { status: 201 });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { deviceId } = (await request.json()) as RsvpBody;

  if (!deviceId) {
    return Response.json({ error: "deviceId is required" }, { status: 400 });
  }

  const result = await getUpcomingParty(id);
  if ("error" in result) {
    return Response.json({ error: result.error }, { status: result.status });
  }

  const fan = await prisma.fan.findUnique({ where: { deviceId } });
  if (fan) {
    await prisma.rSVP.deleteMany({ where: { fanId: fan.id, watchPartyId: id } });
  }

  const rsvpCount = await prisma.rSVP.count({ where: { watchPartyId: id } });

  return Response.json({ isRsvpd: false, rsvpCount });
}
