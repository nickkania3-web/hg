"use client";

import { getTierInfo } from "@/lib/ranking";
import WatchPartyIndicator from "@/components/WatchPartyIndicator";
import type { RankedBarDTO, TeamBarEntryDTO } from "@/lib/types";

// Accepts either a single-team RankedBarDTO (used by /search) or a
// multi-team TeamBarEntryDTO (used by the main page) — teamId/teamName are
// only present in the latter, and drive the optional team label + which
// team a verification/watch-party gets attributed to.
export type BarCardEntry = RankedBarDTO &
  Partial<Pick<TeamBarEntryDTO, "teamId" | "teamName" | "sport">>;

interface BarCardProps {
  bar: BarCardEntry;
  isSelected: boolean;
  isFavorited: boolean;
  onSelect: (barId: string) => void;
  onVerify: (bar: BarCardEntry) => void;
  onToggleFavorite: (barId: string) => void;
  onOpenWatchParties: (bar: BarCardEntry) => void;
}

export default function BarCard({
  bar,
  isSelected,
  isFavorited,
  onSelect,
  onVerify,
  onToggleFavorite,
  onOpenWatchParties,
}: BarCardProps) {
  const tier = getTierInfo(bar.verificationCount);
  const hasUpcomingWatchParty = bar.upcomingWatchPartyCount > 0;

  let borderClass = "border-zinc-200 hover:border-zinc-400";
  if (isSelected) {
    borderClass = "border-brand ring-1 ring-brand";
  } else if (hasUpcomingWatchParty) {
    borderClass = "border-watch ring-1 ring-watch";
  }

  return (
    <div
      onClick={() => onSelect(bar.id)}
      className={`cursor-pointer rounded-xl border bg-white p-4 shadow-sm transition-colors ${borderClass}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          {bar.teamName && (
            <p className="text-xs font-medium text-zinc-400">
              {bar.teamName} · {bar.sport}
            </p>
          )}
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

      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="text-sm text-zinc-500">
          {bar.verificationCount}{" "}
          {bar.verificationCount === 1 ? "fan check-in" : "fan check-ins"}
        </span>
        <div className="flex items-center gap-3">
          <WatchPartyIndicator
            upcomingCount={bar.upcomingWatchPartyCount}
            pastCount={bar.pastWatchPartyCount}
            onClick={() => onOpenWatchParties(bar)}
          />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onVerify(bar);
            }}
            className="shrink-0 rounded-lg bg-brand px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-dark"
          >
            I watched here
          </button>
        </div>
      </div>
    </div>
  );
}
