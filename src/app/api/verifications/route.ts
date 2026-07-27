import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db";

const SPAM_GUARD_HOURS = 12;

interface VerificationBody {
  deviceId?: string;
  displayName?: string;
  teamId?: string;
  barId?: string;
  note?: string;
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as VerificationBody;
  const { deviceId, displayName, teamId, barId, note } = body;

  if (!deviceId || !teamId || !barId) {
    return Response.json(
      { error: "deviceId, teamId, and barId are required" },
      { status: 400 }
    );
  }

  const fan = await prisma.fan.upsert({
    where: { deviceId },
    update: displayName ? { displayName } : {},
    create: { deviceId, displayName: displayName || null },
  });

  const spamGuardCutoff = new Date(
    Date.now() - SPAM_GUARD_HOURS * 60 * 60 * 1000
  );
  const recentDuplicate = await prisma.verification.findFirst({
    where: {
      fanId: fan.id,
      teamId,
      barId,
      createdAt: { gte: spamGuardCutoff },
    },
  });

  if (recentDuplicate) {
    return Response.json(
      {
        error: `You already verified this bar for this team in the last ${SPAM_GUARD_HOURS} hours.`,
      },
      { status: 429 }
    );
  }

  const [, updatedLink] = await prisma.$transaction([
    prisma.verification.create({
      data: { fanId: fan.id, teamId, barId, note: note || null },
    }),
    prisma.teamBarLink.upsert({
      where: { teamId_barId: { teamId, barId } },
      update: { verificationCount: { increment: 1 } },
      create: { teamId, barId, verificationCount: 1 },
    }),
  ]);

  return Response.json(
    { verificationCount: updatedLink.verificationCount },
    { status: 201 }
  );
}
