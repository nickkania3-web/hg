"use client";

import { useState } from "react";
import { getDeviceId } from "@/lib/deviceId";
import TeamPicker from "@/components/TeamPicker";
import type { BarDirectoryItemDTO, TeamDTO } from "@/lib/types";

interface WatchPartyFormProps {
  teams: TeamDTO[];
  bars: BarDirectoryItemDTO[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function WatchPartyForm({
  teams,
  bars,
  onClose,
  onSuccess,
}: WatchPartyFormProps) {
  const [teamId, setTeamId] = useState("");
  const [barId, setBarId] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!teamId || !barId || !dateTime) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/watch-parties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceId: getDeviceId(),
          teamId,
          barId,
          dateTime: new Date(dateTime).toISOString(),
          note: note.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Something went wrong.");
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-zinc-900">
          Host a watch party
        </h2>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <TeamPicker teams={teams} value={teamId} onChange={setTeamId} />

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-zinc-700">At...</span>
            <select
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-base text-zinc-900 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
              value={barId}
              onChange={(e) => setBarId(e.target.value)}
              required
            >
              <option value="" disabled>
                Select a bar
              </option>
              {bars.map((bar) => (
                <option key={bar.id} value={bar.id}>
                  {bar.name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-zinc-700">Date &amp; time</span>
            <input
              type="datetime-local"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              required
              className="rounded-lg border border-zinc-300 px-3 py-2 text-base focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-zinc-700">
              Note (optional)
            </span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="vs Michigan, watching in the back room"
              rows={2}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-base focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
            />
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="mt-1 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !teamId || !barId || !dateTime}
              className="flex-1 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:bg-zinc-300"
            >
              {submitting ? "Creating..." : "Create watch party"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
