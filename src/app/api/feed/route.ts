import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import type { FeedEntryDTO, FeedPageDTO } from "@/lib/types";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const limit = Math.min(Number(params.get("limit")) || DEFAULT_LIMIT, MAX_LIMIT);
  const cursor = params.get("cursor");

  const rows = await prisma.verification.findMany({
    take: limit + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    include: {
      fan: { select: { displayName: true } },
      team: { select: { name: true, sport: true } },
      bar: { select: { name: true } },
    },
  });

  const hasMore = rows.length > limit;
  const page = rows.slice(0, limit);

  const entries: FeedEntryDTO[] = page.map((v) => ({
    id: v.id,
    name: v.fan.displayName || "A HomeGame fan",
    teamName: v.team.name,
    sport: v.team.sport,
    barName: v.bar.name,
    createdAt: v.createdAt.toISOString(),
  }));

  const dto: FeedPageDTO = {
    entries,
    nextCursor: hasMore ? page[page.length - 1].id : null,
  };

  return Response.json(dto);
}
