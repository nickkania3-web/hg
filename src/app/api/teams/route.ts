import { prisma } from "@/lib/db";
import type { TeamDTO } from "@/lib/types";

export async function GET() {
  const teams = await prisma.team.findMany({
    orderBy: [{ sport: "asc" }, { name: "asc" }],
  });

  const dto: TeamDTO[] = teams.map((t) => ({
    id: t.id,
    name: t.name,
    sport: t.sport,
    league: t.league,
    logoUrl: t.logoUrl,
  }));

  return Response.json(dto);
}
