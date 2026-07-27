"use client";

import BarCard from "@/components/BarCard";
import type { RankedBarDTO } from "@/lib/types";

interface BarListProps {
  bars: RankedBarDTO[];
  selectedBarId: string | null;
  favoritedBarIds: Set<string>;
  onSelect: (barId: string) => void;
  onVerify: (barId: string) => void;
  onToggleFavorite: (barId: string) => void;
}

export default function BarList({
  bars,
  selectedBarId,
  favoritedBarIds,
  onSelect,
  onVerify,
  onToggleFavorite,
}: BarListProps) {
  if (bars.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-zinc-500">
        No verified fan spots yet for this team in this city. Be the first to
        check in.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {bars.map((bar) => (
        <BarCard
          key={bar.id}
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
