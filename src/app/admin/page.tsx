import Link from "next/link";
import { prisma } from "@/lib/db";
import AdminTable from "@/components/AdminTable";
import Logo from "@/components/Logo";
import type { AdminSummaryRow } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const teams = await prisma.team.findMany({
    include: { barLinks: { select: { verificationCount: true } } },
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

  return (
    <div className="flex flex-1 flex-col bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center gap-4">
          <Link href="/">
            <Logo />
          </Link>
          <Link href="/" className="text-sm text-zinc-500 hover:text-brand">
            &larr; Home
          </Link>
        </div>
      </header>

      <div className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
        <h1 className="text-2xl font-bold text-zinc-900">
          Verification Activity by Team
        </h1>
        <p className="mt-1 text-zinc-500">
          Sport/team combos ranked by total fan check-ins across all bars.
        </p>
        <div className="mt-6 overflow-x-auto">
          <AdminTable rows={rows} />
        </div>
      </div>
    </div>
  );
}
