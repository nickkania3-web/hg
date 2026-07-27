"use client";

import { useState } from "react";
import { getDeviceId } from "@/lib/deviceId";

interface WatchPartyFormProps {
  teamId: string;
  barId: string;
  onCancel: () => void;
  onSuccess: () => void;
}

// Inline host form, pre-filled with a fixed team+bar from context — no
// team/bar picker. Meant to be embedded inside WatchPartyModal, not
// rendered as its own overlay.
export default function WatchPartyForm({
  teamId,
  barId,
  onCancel,
  onSuccess,
}: WatchPartyFormProps) {
  const [dateTime, setDateTime] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!dateTime) return;

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
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4"
    >
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-zinc-700">Date &amp; time</span>
        <input
          type="datetime-local"
          value={dateTime}
          onChange={(e) => setDateTime(e.target.value)}
          required
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
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
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
        />
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting || !dateTime}
          className="flex-1 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:bg-zinc-300"
        >
          {submitting ? "Creating..." : "Create watch party"}
        </button>
      </div>
    </form>
  );
}
