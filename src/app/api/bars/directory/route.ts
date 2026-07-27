import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import type { BarDirectoryItemDTO } from "@/lib/types";

// Plain city-wide bar listing, independent of any team — used by pickers
// (e.g. the watch party host form) that aren't ranking bars for a team.
export async function GET(request: NextRequest) {
  const city = request.nextUrl.searchParams.get("city");

  if (!city) {
    return Response.json({ error: "city is required" }, { status: 400 });
  }

  const bars = await prisma.bar.findMany({
    where: { city: { equals: city, mode: "insensitive" } },
    orderBy: { name: "asc" },
  });

  const dto: BarDirectoryItemDTO[] = bars.map((b) => ({
    id: b.id,
    name: b.name,
    address: b.address,
  }));

  return Response.json(dto);
}
