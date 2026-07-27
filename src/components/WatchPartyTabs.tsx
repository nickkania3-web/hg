"use client";

interface WatchPartyTabsProps {
  status: "upcoming" | "past";
  onChange: (status: "upcoming" | "past") => void;
}

export default function WatchPartyTabs({ status, onChange }: WatchPartyTabsProps) {
  return (
    <div className="inline-flex rounded-lg border border-zinc-300 bg-white p-1">
      {(["upcoming", "past"] as const).map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          className={`rounded-md px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
            status === s ? "bg-zinc-900 text-white" : "text-zinc-600 hover:text-zinc-900"
          }`}
        >
          {s}
        </button>
      ))}
    </div>
  );
}
