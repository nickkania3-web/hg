import { prisma } from "@/lib/db";
import type { AdminSummaryRow } from "@/lib/types";

export async function GET() {
  const teams = await prisma.team.findMany({
    include: {
      barLinks: { select: { verificationCount: true } },
    },
  });

  const rows: AdminSummaryRow[] = teams
    .map((team) => ({
      teamId: team.id,
      teamName: team.name,
      sport: team.sport,
      league: team.league,
      verificationCount: team.barLinks.reduce(
        (sum, link) => sum + link.verificationCount,
        0
      ),
    }))
    .sort((a, b) => b.verificationCount - a.verificationCount);

  return Response.json(rows);
}
