import { prisma } from "@/lib/db";

interface WatchPartyCounts {
  upcoming: number;
  past: number;
}

export function watchPartyKey(teamId: string, barId: string): string {
  return `${teamId}::${barId}`;
}

// Batched upcoming/past WatchParty counts for a set of (teamId, barId)
// pairs — one extra query regardless of list size, so bar-list endpoints
// can attach counts to every row without an N+1.
export async function getWatchPartySummary(
  pairs: { teamId: string; barId: string }[]
): Promise<Map<string, WatchPartyCounts>> {
  const summary = new Map<string, WatchPartyCounts>();
  if (pairs.length === 0) return summary;

  const uniquePairs = Array.from(
    new Map(pairs.map((p) => [watchPartyKey(p.teamId, p.barId), p])).values()
  );

  const watchParties = await prisma.watchParty.findMany({
    where: { OR: uniquePairs.map((p) => ({ teamId: p.teamId, barId: p.barId })) },
    select: { teamId: true, barId: true, dateTime: true },
  });

  const now = new Date();
  for (const wp of watchParties) {
    const key = watchPartyKey(wp.teamId, wp.barId);
    const entry = summary.get(key) ?? { upcoming: 0, past: 0 };
    if (wp.dateTime >= now) entry.upcoming += 1;
    else entry.past += 1;
    summary.set(key, entry);
  }

  return summary;
}
