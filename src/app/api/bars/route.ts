import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
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

  const dto: RankedBarDTO[] = links.map((link) => ({
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
  }));

  return Response.json(dto);
}
