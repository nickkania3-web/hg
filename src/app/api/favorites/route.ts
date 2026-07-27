import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db";

interface FavoriteBody {
  deviceId?: string;
  barId?: string;
}

export async function GET(request: NextRequest) {
  const deviceId = request.nextUrl.searchParams.get("deviceId");
  if (!deviceId) {
    return Response.json({ error: "deviceId is required" }, { status: 400 });
  }

  const fan = await prisma.fan.findUnique({
    where: { deviceId },
    include: { barFavorites: { select: { barId: true } } },
  });

  return Response.json({
    barIds: fan ? fan.barFavorites.map((f) => f.barId) : [],
  });
}

export async function POST(request: NextRequest) {
  const { deviceId, barId } = (await request.json()) as FavoriteBody;

  if (!deviceId || !barId) {
    return Response.json(
      { error: "deviceId and barId are required" },
      { status: 400 }
    );
  }

  const fan = await prisma.fan.upsert({
    where: { deviceId },
    update: {},
    create: { deviceId },
  });

  await prisma.fanBarFavorite.upsert({
    where: { fanId_barId: { fanId: fan.id, barId } },
    update: {},
    create: { fanId: fan.id, barId },
  });

  return Response.json({ favorited: true }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const { deviceId, barId } = (await request.json()) as FavoriteBody;

  if (!deviceId || !barId) {
    return Response.json(
      { error: "deviceId and barId are required" },
      { status: 400 }
    );
  }

  const fan = await prisma.fan.findUnique({ where: { deviceId } });
  if (fan) {
    await prisma.fanBarFavorite.deleteMany({
      where: { fanId: fan.id, barId },
    });
  }

  return Response.json({ favorited: false });
}
