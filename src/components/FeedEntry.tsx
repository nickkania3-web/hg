import { formatRelativeTime } from "@/lib/time";
import type { FeedEntryDTO } from "@/lib/types";

interface FeedEntryProps {
  entry: FeedEntryDTO;
}

export default function FeedEntry({ entry }: FeedEntryProps) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <p className="text-sm text-zinc-800">
        <span className="font-semibold text-zinc-900">{entry.name}</span>{" "}
        watched <span className="font-medium">{entry.teamName}</span>{" "}
        {entry.sport.toLowerCase()} at{" "}
        <span className="font-medium">{entry.barName}</span>
        <span className="text-zinc-400"> — {formatRelativeTime(entry.createdAt)}</span>
      </p>
    </div>
  );
}
