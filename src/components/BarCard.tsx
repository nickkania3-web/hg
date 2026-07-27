"use client";

import { getTierInfo } from "@/lib/ranking";
import type { RankedBarDTO } from "@/lib/types";

interface BarCardProps {
  bar: RankedBarDTO;
  isSelected: boolean;
  isFavorited: boolean;
  onSelect: (barId: string) => void;
  onVerify: (barId: string) => void;
  onToggleFavorite: (barId: string) => void;
}

export default function BarCard({
  bar,
  isSelected,
  isFavorited,
  onSelect,
  onVerify,
  onToggleFavorite,
}: BarCardProps) {
  const tier = getTierInfo(bar.verificationCount);

  return (
    <div
      onClick={() => onSelect(bar.id)}
      className={`cursor-pointer rounded-xl border bg-white p-4 shadow-sm transition-colors ${
        isSelected
          ? "border-brand ring-1 ring-brand"
          : "border-zinc-200 hover:border-zinc-400"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-zinc-900">{bar.name}</h3>
          <p className="text-sm text-zinc-500">{bar.address}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span
            className={`whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium ${tier.badgeClass}`}
          >
            {tier.label}
          </span>
          <button
            type="button"
            aria-label={isFavorited ? "Remove favorite" : "Add favorite"}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(bar.id);
            }}
            className={`text-xl leading-none ${
              isFavorited ? "text-amber-500" : "text-zinc-300 hover:text-zinc-400"
            }`}
          >
            {isFavorited ? "★" : "☆"}
          </button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-600">
        {bar.tvCount != null && <span>{bar.tvCount} TVs</span>}
        {bar.capacity != null && <span>Capacity ~{bar.capacity}</span>}
        {bar.soundPolicy && <span>{bar.soundPolicy}</span>}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-sm text-zinc-500">
          {bar.verificationCount}{" "}
          {bar.verificationCount === 1 ? "fan check-in" : "fan check-ins"}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onVerify(bar.id);
          }}
          className="rounded-lg bg-brand px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-dark"
        >
          I watched here
        </button>
      </div>
    </div>
  );
}
