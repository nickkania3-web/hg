"use client";

import { useEffect, useState } from "react";
import RsvpButton from "@/components/RsvpButton";
import WatchPartyForm from "@/components/WatchPartyForm";
import { formatPartyDateTime } from "@/lib/format";
import { getDeviceId } from "@/lib/deviceId";
import type { WatchPartyForBarEntryDTO } from "@/lib/types";

interface WatchPartyModalProps {
  teamId: string;
  barId: string;
  teamName: string;
  barName: string;
  onClose: () => void;
  // Called after any change (RSVP toggle, new party hosted) that affects
  // the upcoming/past counts shown on the underlying bar card, so the
  // parent can refresh its bar list.
  onChanged: () => void;
}

export default function WatchPartyModal({
  teamId,
  barId,
  teamName,
  barName,
  onClose,
  onChanged,
}: WatchPartyModalProps) {
  const [parties, setParties] = useState<WatchPartyForBarEntryDTO[] | null>(null);
  const [showHostForm, setShowHostForm] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const listUrl = `/api/watch-parties/for-team-bar?teamId=${encodeURIComponent(
    teamId
  )}&barId=${encodeURIComponent(barId)}&deviceId=${encodeURIComponent(getDeviceId())}`;

  async function loadParties() {
    const res = await fetch(listUrl);
    const data: WatchPartyForBarEntryDTO[] = await res.json();
    setParties(data);
  }

  useEffect(() => {
    let ignore = false;
    fetch(listUrl)
      .then((res) => res.json())
      .then((data: WatchPartyForBarEntryDTO[]) => {
        if (!ignore) setParties(data);
      });
    return () => {
      ignore = true;
    };
  }, [listUrl]);

  async function toggleRsvp(party: WatchPartyForBarEntryDTO) {
    setBusyId(party.id);
    try {
      const res = await fetch(`/api/watch-parties/${party.id}/rsvps`, {
        method: party.isRsvpd ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId: getDeviceId() }),
      });
      if (res.ok) {
        await loadParties();
        onChanged();
      }
    } finally {
      setBusyId(null);
    }
  }

  const loading = parties === null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-zinc-900">
          Watch parties at {barName}
        </h2>
        <p className="text-sm text-zinc-500">{teamName}</p>

        <div className="mt-4 flex flex-col gap-3">
          {loading ? (
            <p className="text-sm text-zinc-500">Loading...</p>
          ) : parties.length === 0 ? (
            <p className="text-sm text-zinc-500">
              No watch parties here yet.
            </p>
          ) : (
            parties.map((party) => (
              <div
                key={party.id}
                className="rounded-xl border border-zinc-200 p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-zinc-900">
                      {formatPartyDateTime(party.dateTime)}
                    </p>
                    {party.note && (
                      <p className="text-sm text-zinc-600">{party.note}</p>
                    )}
                  </div>
                  {party.isPast && (
                    <span className="shrink-0 rounded-full border border-zinc-300 bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500">
                      Past
                    </span>
                  )}
                </div>

                <div className="mt-2 flex items-center justify-between gap-3">
                  <span className="text-sm text-zinc-500">
                    {party.rsvpCount} fan{party.rsvpCount === 1 ? "" : "s"}{" "}
                    RSVP&apos;d
                  </span>
                  {!party.isPast && (
                    <RsvpButton
                      isRsvpd={party.isRsvpd}
                      disabled={busyId === party.id}
                      onToggle={() => toggleRsvp(party)}
                    />
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-4">
          {showHostForm ? (
            <WatchPartyForm
              teamId={teamId}
              barId={barId}
              onCancel={() => setShowHostForm(false)}
              onSuccess={async () => {
                setShowHostForm(false);
                await loadParties();
                onChanged();
              }}
            />
          ) : (
            <button
              type="button"
              onClick={() => setShowHostForm(true)}
              className="w-full rounded-lg border border-dashed border-zinc-300 py-2 text-sm font-medium text-zinc-600 hover:border-brand hover:text-brand"
            >
              + Host a watch party here
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Close
        </button>
      </div>
    </div>
  );
}
