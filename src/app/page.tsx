"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Logo from "@/components/Logo";
import TeamMultiSelect from "@/components/TeamMultiSelect";
import SelectedTeamsStrip from "@/components/SelectedTeamsStrip";
import BarList from "@/components/BarList";
import VerifyForm from "@/components/VerifyForm";
import type { BarCardEntry } from "@/components/BarCard";
import { getDeviceId } from "@/lib/deviceId";
import type { TeamBarEntryDTO, TeamDTO } from "@/lib/types";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-zinc-400">
      Loading map...
    </div>
  ),
});

export default function Home() {
  const [teams, setTeams] = useState<TeamDTO[]>([]);
  const [selectedTeamIds, setSelectedTeamIds] = useState<Set<string>>(new Set());
  const [city, setCity] = useState("Chicago");
  const [entries, setEntries] = useState<TeamBarEntryDTO[] | null>(null);
  const [selectedBarId, setSelectedBarId] = useState<string | null>(null);
  const [verifyingEntry, setVerifyingEntry] = useState<BarCardEntry | null>(null);
  const [favoritedBarIds, setFavoritedBarIds] = useState<Set<string>>(new Set());

  const teamIdsKey = Array.from(selectedTeamIds).sort().join(",");
  const barsUrl =
    selectedTeamIds.size > 0
      ? `/api/bars/for-teams?teamIds=${encodeURIComponent(
          teamIdsKey
        )}&city=${encodeURIComponent(city)}`
      : null;

  const loadEntries = useCallback(async () => {
    if (!barsUrl) return;
    const res = await fetch(barsUrl);
    const data: TeamBarEntryDTO[] = await res.json();
    setEntries(data);
  }, [barsUrl]);

  useEffect(() => {
    fetch("/api/teams")
      .then((res) => res.json())
      .then(setTeams)
      .catch(() => setTeams([]));
  }, []);

  useEffect(() => {
    let ignore = false;
    const deviceId = getDeviceId();

    fetch(`/api/follows?deviceId=${encodeURIComponent(deviceId)}`)
      .then((res) => res.json())
      .then((data: { teamIds: string[] }) => {
        if (!ignore) setSelectedTeamIds(new Set(data.teamIds));
      });

    fetch(`/api/favorites?deviceId=${encodeURIComponent(deviceId)}`)
      .then((res) => res.json())
      .then((data: { barIds: string[] }) => {
        if (!ignore) setFavoritedBarIds(new Set(data.barIds));
      });

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    // No selected teams: the render branch below never reads `entries` in
    // that state, so there's nothing to fetch or reset here.
    if (!barsUrl) return;

    let ignore = false;
    fetch(barsUrl)
      .then((res) => res.json())
      .then((data: TeamBarEntryDTO[]) => {
        if (!ignore) setEntries(data);
      });
    return () => {
      ignore = true;
    };
  }, [barsUrl]);

  async function toggleTeam(teamId: string) {
    const deviceId = getDeviceId();
    const isSelected = selectedTeamIds.has(teamId);
    setSelectedTeamIds((prev) => {
      const next = new Set(prev);
      if (isSelected) next.delete(teamId);
      else next.add(teamId);
      return next;
    });
    await fetch("/api/follows", {
      method: isSelected ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deviceId, teamId }),
    });
  }

  async function toggleFavorite(barId: string) {
    const deviceId = getDeviceId();
    const isFavorited = favoritedBarIds.has(barId);
    setFavoritedBarIds((prev) => {
      const next = new Set(prev);
      if (isFavorited) next.delete(barId);
      else next.add(barId);
      return next;
    });
    await fetch("/api/favorites", {
      method: isFavorited ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deviceId, barId }),
    });
  }

  const loading = entries === null;
  const selectedTeams = teams.filter((t) => selectedTeamIds.has(t.id));

  return (
    <div className="flex flex-1 flex-col bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Logo />
            </Link>
            <SelectedTeamsStrip teams={selectedTeams} />
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/timeline" className="text-zinc-500 hover:text-brand">
              Timeline
            </Link>
            <Link href="/profile" className="text-zinc-500 hover:text-brand">
              My Profile
            </Link>
            <Link href="/watch-parties" className="text-zinc-500 hover:text-brand">
              Watch Parties
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-6xl flex-1 px-6 py-6">
        <div className="mb-6 rounded-2xl border border-zinc-200 bg-white p-5">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="min-w-0 flex-1">
              <h2 className="mb-3 text-sm font-semibold text-zinc-900">
                Choose My Team
              </h2>
              <TeamMultiSelect
                teams={teams}
                selectedTeamIds={selectedTeamIds}
                onToggle={toggleTeam}
              />
            </div>
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
        </div>

        {selectedTeamIds.size === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-zinc-500">
            Choose at least one team above to see where its fans watch the
            game.
          </div>
        ) : (
          <div className="flex flex-col gap-6 lg:flex-row">
            <div className="flex-1 lg:max-w-md">
              {loading ? (
                <p className="text-zinc-500">Loading bars...</p>
              ) : (
                <BarList
                  bars={entries}
                  selectedBarId={selectedBarId}
                  favoritedBarIds={favoritedBarIds}
                  onSelect={setSelectedBarId}
                  onVerify={setVerifyingEntry}
                  onToggleFavorite={toggleFavorite}
                  emptyMessage="No verified fan spots yet for your selected teams in this city. Be the first to check in."
                />
              )}
            </div>

            <div className="isolate h-[400px] flex-1 overflow-hidden rounded-2xl border border-zinc-200 lg:h-auto lg:min-h-[500px]">
              <MapView
                bars={entries ?? []}
                selectedBarId={selectedBarId}
                onSelect={setSelectedBarId}
              />
            </div>
          </div>
        )}
      </div>

      {verifyingEntry && verifyingEntry.teamId && (
        <VerifyForm
          barName={verifyingEntry.name}
          teamId={verifyingEntry.teamId}
          barId={verifyingEntry.id}
          onClose={() => setVerifyingEntry(null)}
          onSuccess={() => {
            setVerifyingEntry(null);
            loadEntries();
          }}
        />
      )}
    </div>
  );
}
