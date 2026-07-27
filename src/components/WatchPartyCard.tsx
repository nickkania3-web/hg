import Link from "next/link";
import { formatPartyDateTime } from "@/lib/format";
import type { WatchPartyListItemDTO } from "@/lib/types";

interface WatchPartyCardProps {
  party: WatchPartyListItemDTO;
}

export default function WatchPartyCard({ party }: WatchPartyCardProps) {
  return (
    <Link
      href={`/watch-parties/${party.id}`}
      className="block rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition-colors hover:border-zinc-400"
    >
      <p className="font-semibold text-zinc-900">
        {party.teamName} watch party at {party.barName}
      </p>
      <p className="mt-1 text-sm text-zinc-500">
        {formatPartyDateTime(party.dateTime)} · {party.rsvpCount} confirmed
      </p>
    </Link>
  );
}
