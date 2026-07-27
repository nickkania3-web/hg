"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import WatchPartyTabs from "@/components/WatchPartyTabs";
import WatchPartyCard from "@/components/WatchPartyCard";
import WatchPartyForm from "@/components/WatchPartyForm";
import Logo from "@/components/Logo";
import type { BarDirectoryItemDTO, TeamDTO, WatchPartyListItemDTO } from "@/lib/types";

export default function WatchPartiesPage() {
  const [city, setCity] = useState("Chicago");
  const [status, setStatus] = useState<"upcoming" | "past">("upcoming");
  const [parties, setParties] = useState<WatchPartyListItemDTO[] | null>(null);
  const [teams, setTeams] = useState<TeamDTO[]>([]);
  const [bars, setBars] = useState<BarDirectoryItemDTO[]>([]);
  const [showHostForm, setShowHostForm] = useState(false);

  const partiesUrl = `/api/watch-parties?city=${encodeURIComponent(
    city
  )}&status=${status}`;

  const loadParties = useCallback(async () => {
    const res = await fetch(partiesUrl);
    const data: WatchPartyListItemDTO[] = await res.json();
    setParties(data);
  }, [partiesUrl]);

  useEffect(() => {
    fetch("/api/teams")
      .then((res) => res.json())
      .then(setTeams)
      .catch(() => setTeams([]));
  }, []);

  useEffect(() => {
    let ignore = false;
    fetch(`/api/bars/directory?city=${encodeURIComponent(city)}`)
      .then((res) => res.json())
      .then((data: BarDirectoryItemDTO[]) => {
        if (!ignore) setBars(data);
      });
    return () => {
      ignore = true;
    };
  }, [city]);

  useEffect(() => {
    let ignore = false;
    fetch(partiesUrl)
      .then((res) => res.json())
      .then((data: WatchPartyListItemDTO[]) => {
        if (!ignore) setParties(data);
      });
    return () => {
      ignore = true;
    };
  }, [partiesUrl]);

  const loading = parties === null;

  return (
    <div className="flex flex-1 flex-col bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Logo />
            </Link>
            <div>
              <Link href="/" className="text-sm text-zinc-500 hover:text-brand">
                &larr; Home
              </Link>
              <h1 className="text-xl font-bold text-zinc-900">Watch Parties</h1>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowHostForm(true)}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            Host a watch party
          </button>
        </div>
      </header>

      <div className="mx-auto w-full max-w-3xl flex-1 px-6 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <WatchPartyTabs status={status} onChange={setStatus} />
          <label className="flex items-center gap-2 text-sm text-zinc-600">
            City
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Chicago"
              className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
            />
          </label>
        </div>

        {loading ? (
          <p className="text-zinc-500">Loading watch parties...</p>
        ) : parties.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-zinc-500">
            No {status} watch parties in {city} yet.
            {status === "upcoming" && " Be the first to host one."}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {parties.map((party) => (
              <WatchPartyCard key={party.id} party={party} />
            ))}
          </div>
        )}
      </div>

      {showHostForm && (
        <WatchPartyForm
          teams={teams}
          bars={bars}
          onClose={() => setShowHostForm(false)}
          onSuccess={() => {
            setShowHostForm(false);
            setStatus("upcoming");
            loadParties();
          }}
        />
      )}
    </div>
  );
}
