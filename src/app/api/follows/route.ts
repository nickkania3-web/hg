import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db";

interface FollowBody {
  deviceId?: string;
  teamId?: string;
}

export async function GET(request: NextRequest) {
  const deviceId = request.nextUrl.searchParams.get("deviceId");
  if (!deviceId) {
    return Response.json({ error: "deviceId is required" }, { status: 400 });
  }

  const fan = await prisma.fan.findUnique({
    where: { deviceId },
    include: { teamFollows: { select: { teamId: true } } },
  });

  return Response.json({
    teamIds: fan ? fan.teamFollows.map((f) => f.teamId) : [],
  });
}

export async function POST(request: NextRequest) {
  const { deviceId, teamId } = (await request.json()) as FollowBody;

  if (!deviceId || !teamId) {
    return Response.json(
      { error: "deviceId and teamId are required" },
      { status: 400 }
    );
  }

  const fan = await prisma.fan.upsert({
    where: { deviceId },
    update: {},
    create: { deviceId },
  });

  await prisma.fanTeamFollow.upsert({
    where: { fanId_teamId: { fanId: fan.id, teamId } },
    update: {},
    create: { fanId: fan.id, teamId },
  });

  return Response.json({ following: true }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const { deviceId, teamId } = (await request.json()) as FollowBody;

  if (!deviceId || !teamId) {
    return Response.json(
      { error: "deviceId and teamId are required" },
      { status: 400 }
    );
  }

  const fan = await prisma.fan.findUnique({ where: { deviceId } });
  if (fan) {
    await prisma.fanTeamFollow.deleteMany({
      where: { fanId: fan.id, teamId },
    });
  }

  return Response.json({ following: false });
}
