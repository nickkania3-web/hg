import type { AdminSummaryRow } from "@/lib/types";

interface AdminTableProps {
  rows: AdminSummaryRow[];
}

export default function AdminTable({ rows }: AdminTableProps) {
  return (
    <table className="w-full border-collapse overflow-hidden rounded-xl border border-zinc-200 bg-white text-left text-sm">
      <thead className="bg-zinc-50 text-zinc-500">
        <tr>
          <th className="px-4 py-3 font-medium">Team</th>
          <th className="px-4 py-3 font-medium">Sport</th>
          <th className="px-4 py-3 font-medium">League</th>
          <th className="px-4 py-3 font-medium">Verifications</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr
            key={row.teamId}
            className={i % 2 === 0 ? "bg-white" : "bg-zinc-50/50"}
          >
            <td className="border-t border-zinc-100 px-4 py-3 font-medium text-zinc-900">
              {row.teamName}
            </td>
            <td className="border-t border-zinc-100 px-4 py-3 text-zinc-600">
              {row.sport}
            </td>
            <td className="border-t border-zinc-100 px-4 py-3 text-zinc-600">
              {row.league}
            </td>
            <td className="border-t border-zinc-100 px-4 py-3 text-zinc-900">
              {row.verificationCount}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
