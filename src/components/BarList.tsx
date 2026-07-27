"use client";

import BarCard, { type BarCardEntry } from "@/components/BarCard";

interface BarListProps {
  bars: BarCardEntry[];
  selectedBarId: string | null;
  favoritedBarIds: Set<string>;
  onSelect: (barId: string) => void;
  onVerify: (bar: BarCardEntry) => void;
  onToggleFavorite: (barId: string) => void;
  emptyMessage?: string;
}

export default function BarList({
  bars,
  selectedBarId,
  favoritedBarIds,
  onSelect,
  onVerify,
  onToggleFavorite,
  emptyMessage = "No verified fan spots yet for this team in this city. Be the first to check in.",
}: BarListProps) {
  if (bars.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-zinc-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {bars.map((bar) => (
        <BarCard
          key={bar.teamId ? `${bar.teamId}-${bar.id}` : bar.id}
          bar={bar}
          isSelected={bar.id === selectedBarId}
          isFavorited={favoritedBarIds.has(bar.id)}
          onSelect={onSelect}
          onVerify={onVerify}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
}
