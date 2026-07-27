"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import RsvpButton from "@/components/RsvpButton";
import Logo from "@/components/Logo";
import { formatPartyDateTime } from "@/lib/format";
import { getDeviceId } from "@/lib/deviceId";
import type { WatchPartyDetailDTO } from "@/lib/types";

interface WatchPartyDetailClientProps {
  id: string;
}

export default function WatchPartyDetailClient({ id }: WatchPartyDetailClientProps) {
  const [party, setParty] = useState<WatchPartyDetailDTO | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [rsvpBusy, setRsvpBusy] = useState(false);

  const detailUrl = `/api/watch-parties/${id}?deviceId=${encodeURIComponent(
    getDeviceId()
  )}`;

  const loadParty = useCallback(async () => {
    const res = await fetch(detailUrl);
    if (res.status === 404) {
      setNotFound(true);
      return;
    }
    const data: WatchPartyDetailDTO = await res.json();
    setParty(data);
  }, [detailUrl]);

  useEffect(() => {
    let ignore = false;
    fetch(detailUrl).then(async (res) => {
      if (ignore) return;
      if (res.status === 404) {
        setNotFound(true);
        return;
      }
      const data: WatchPartyDetailDTO = await res.json();
      if (!ignore) setParty(data);
    });
    return () => {
      ignore = true;
    };
  }, [detailUrl]);

  async function toggleRsvp() {
    if (!party) return;
    setRsvpBusy(true);
    try {
      const res = await fetch(`/api/watch-parties/${id}/rsvps`, {
        method: party.isRsvpd ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId: getDeviceId() }),
      });
      if (res.ok) {
        await loadParty();
      }
    } finally {
      setRsvpBusy(false);
    }
  }

  if (notFound) {
    return (
      <div className="flex flex-1 items-center justify-center bg-zinc-50 p-8 text-center text-zinc-500">
        Watch party not found.{" "}
        <Link href="/watch-parties" className="underline">
          Back to watch parties
        </Link>
        .
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-2xl items-center gap-4">
          <Link href="/">
            <Logo />
          </Link>
          <Link
            href="/watch-parties"
            className="text-sm text-zinc-500 hover:text-brand"
          >
            &larr; Watch Parties
          </Link>
        </div>
      </header>

      <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-8">
        {!party ? (
          <p className="text-zinc-500">Loading...</p>
        ) : (
          <div className="flex flex-col gap-6">
            <div>
              <span
                className={`inline-block rounded-full border px-2.5 py-1 text-xs font-medium ${
                  party.isPast
                    ? "border-zinc-300 bg-zinc-100 text-zinc-500"
                    : "border-emerald-300 bg-emerald-100 text-emerald-800"
                }`}
              >
                {party.isPast ? "Past" : "Upcoming"}
              </span>
              <h1 className="mt-2 text-2xl font-bold text-zinc-900">
                {party.teamName} watch party at {party.barName}
              </h1>
              <p className="mt-1 text-zinc-600">{party.barAddress}</p>
              <p className="mt-1 text-zinc-600">
                {formatPartyDateTime(party.dateTime)}
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                Hosted by {party.hostName}
                {party.isHostedBySelf && " (you)"}
              </p>
              {party.note && (
                <p className="mt-3 rounded-lg bg-zinc-100 p-3 text-sm text-zinc-700">
                  {party.note}
                </p>
              )}
            </div>

            {party.isPast ? (
              <p className="text-sm text-zinc-500">
                {party.rsvpCount} fan{party.rsvpCount === 1 ? "" : "s"} confirmed
                for this watch party.
              </p>
            ) : (
              <RsvpButton
                isRsvpd={party.isRsvpd}
                disabled={rsvpBusy}
                onToggle={toggleRsvp}
              />
            )}

            <div>
              <h2 className="text-sm font-semibold text-zinc-700">
                {party.rsvpCount} confirmed
              </h2>
              {party.attendees.length > 0 ? (
                <ul className="mt-2 flex flex-col gap-1">
                  {party.attendees.map((a) => (
                    <li key={a.fanId} className="text-sm text-zinc-600">
                      {a.name}
                      {a.isHost && (
                        <span className="ml-1 text-zinc-400">(host)</span>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                party.rsvpCount > 0 && (
                  <p className="mt-2 text-sm text-zinc-500">
                    Attendee list is too long to show individually.
                  </p>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
