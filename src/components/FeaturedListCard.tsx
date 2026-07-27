"use client";

import type { FeaturedListSummaryDTO } from "@/lib/types";

interface FeaturedListCardProps {
  list: FeaturedListSummaryDTO;
  onClick: () => void;
}

export default function FeaturedListCard({ list, onClick }: FeaturedListCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-start gap-2 rounded-xl border border-zinc-200 bg-white p-4 text-left shadow-sm transition-colors hover:border-brand"
    >
      <h3 className="font-semibold text-zinc-900">{list.title}</h3>
      <ul className="flex flex-col gap-0.5">
        {list.previewItems.map((item, i) => (
          <li key={item.id} className="truncate text-sm text-zinc-600">
            {i + 1}. {item.primaryText}
          </li>
        ))}
      </ul>
      <span className="mt-1 text-xs font-medium text-brand">
        View all {list.totalCount} &rarr;
      </span>
    </button>
  );
}
