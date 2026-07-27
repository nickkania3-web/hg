"use client";

interface WatchPartyIndicatorProps {
  upcomingCount: number;
  pastCount: number;
  onClick: () => void;
}

export default function WatchPartyIndicator({
  upcomingCount,
  pastCount,
  onClick,
}: WatchPartyIndicatorProps) {
  if (upcomingCount === 0 && pastCount === 0) return null;

  const label =
    upcomingCount > 0
      ? `${upcomingCount} watch part${upcomingCount === 1 ? "y" : "ies"} scheduled`
      : `${pastCount} past watch part${pastCount === 1 ? "y" : "ies"}`;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="text-sm font-semibold text-watch hover:text-watch-dark hover:underline"
    >
      {label}
    </button>
  );
}
