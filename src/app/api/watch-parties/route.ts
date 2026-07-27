import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db";

interface CreateWatchPartyBody {
  deviceId?: string;
  teamId?: string;
  barId?: string;
  dateTime?: string;
  note?: string;
}

export async function POST(request: NextRequest) {
  const { deviceId, teamId, barId, dateTime, note } =
    (await request.json()) as CreateWatchPartyBody;

  if (!deviceId || !teamId || !barId || !dateTime) {
    return Response.json(
      { error: "deviceId, teamId, barId, and dateTime are required" },
      { status: 400 }
    );
  }

  const parsedDateTime = new Date(dateTime);
  if (Number.isNaN(parsedDateTime.getTime())) {
    return Response.json({ error: "dateTime is invalid" }, { status: 400 });
  }

  const bar = await prisma.bar.findUnique({ where: { id: barId } });
  if (!bar) {
    return Response.json({ error: "bar not found" }, { status: 404 });
  }

  const fan = await prisma.fan.upsert({
    where: { deviceId },
    update: {},
    create: { deviceId },
  });

  const party = await prisma.watchParty.create({
    data: {
      teamId,
      barId,
      city: bar.city,
      dateTime: parsedDateTime,
      note: note || null,
      createdByFanId: fan.id,
    },
  });

  // Hosting a party implies attending it.
  await prisma.rSVP.create({
    data: { fanId: fan.id, watchPartyId: party.id },
  });

  return Response.json({ id: party.id }, { status: 201 });
}
