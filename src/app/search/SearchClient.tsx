"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import BarList from "@/components/BarList";
import VerifyForm from "@/components/VerifyForm";
import FollowButton from "@/components/FollowButton";
import Logo from "@/components/Logo";
import { getDeviceId } from "@/lib/deviceId";
import type { RankedBarDTO, TeamDTO } from "@/lib/types";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-zinc-400">
      Loading map...
    </div>
  ),
});

interface SearchClientProps {
  teamId: string;
  city: string;
}

export default function SearchClient({ teamId, city }: SearchClientProps) {
  const [team, setTeam] = useState<TeamDTO | null>(null);
  const [bars, setBars] = useState<RankedBarDTO[] | null>(null);
  const [selectedBarId, setSelectedBarId] = useState<string | null>(null);
  const [verifyingBar, setVerifyingBar] = useState<RankedBarDTO | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [favoritedBarIds, setFavoritedBarIds] = useState<Set<string>>(new Set());

  const barsUrl = `/api/bars?teamId=${encodeURIComponent(
    teamId
  )}&city=${encodeURIComponent(city)}`;

  const loadBars = useCallback(async () => {
    const res = await fetch(barsUrl);
    const data: RankedBarDTO[] = await res.json();
    setBars(data);
  }, [barsUrl]);

  useEffect(() => {
    fetch("/api/teams")
      .then((res) => res.json())
      .then((teams: TeamDTO[]) => {
        setTeam(teams.find((t) => t.id === teamId) ?? null);
      });
  }, [teamId]);

  useEffect(() => {
    let ignore = false;
    fetch(barsUrl)
      .then((res) => res.json())
      .then((data: RankedBarDTO[]) => {
        if (!ignore) setBars(data);
      });
    return () => {
      ignore = true;
    };
  }, [barsUrl]);

  useEffect(() => {
    let ignore = false;
    const deviceId = getDeviceId();

    fetch(`/api/follows?deviceId=${encodeURIComponent(deviceId)}`)
      .then((res) => res.json())
      .then((data: { teamIds: string[] }) => {
        if (!ignore) setIsFollowing(data.teamIds.includes(teamId));
      });

    fetch(`/api/favorites?deviceId=${encodeURIComponent(deviceId)}`)
      .then((res) => res.json())
      .then((data: { barIds: string[] }) => {
        if (!ignore) setFavoritedBarIds(new Set(data.barIds));
      });

    return () => {
      ignore = true;
    };
  }, [teamId]);

  const loading = bars === null;

  async function toggleFollow() {
    const deviceId = getDeviceId();
    const nextFollowing = !isFollowing;
    setIsFollowing(nextFollowing);
    await fetch("/api/follows", {
      method: nextFollowing ? "POST" : "DELETE",
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

  return (
    <div className="flex flex-1 flex-col bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Logo />
            </Link>
            <div>
              <Link href="/" className="text-sm text-zinc-500 hover:text-brand">
                &larr; New search
              </Link>
              <h1 className="text-xl font-bold text-zinc-900">
                {team ? team.name : "Loading team..."} fans in {city}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <FollowButton isFollowing={isFollowing} onToggle={toggleFollow} />
            <Link
              href="/profile"
              className="text-sm text-zinc-500 hover:text-brand"
            >
              My Profile
            </Link>
            <Link
              href="/watch-parties"
              className="text-sm text-zinc-500 hover:text-brand"
            >
              Watch Parties
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-6 lg:flex-row">
        <div className="flex-1 lg:max-w-md">
          {loading ? (
            <p className="text-zinc-500">Loading bars...</p>
          ) : (
            <BarList
              bars={bars}
              selectedBarId={selectedBarId}
              favoritedBarIds={favoritedBarIds}
              onSelect={setSelectedBarId}
              onVerify={(barId) =>
                setVerifyingBar(bars.find((b) => b.id === barId) ?? null)
              }
              onToggleFavorite={toggleFavorite}
            />
          )}
        </div>

        <div className="isolate h-[400px] flex-1 overflow-hidden rounded-2xl border border-zinc-200 lg:h-auto lg:min-h-[500px]">
          <MapView
            bars={bars ?? []}
            selectedBarId={selectedBarId}
            onSelect={setSelectedBarId}
          />
        </div>
      </div>

      {verifyingBar && (
        <VerifyForm
          barName={verifyingBar.name}
          teamId={teamId}
          barId={verifyingBar.id}
          onClose={() => setVerifyingBar(null)}
          onSuccess={() => {
            setVerifyingBar(null);
            loadBars();
          }}
        />
      )}
    </div>
  );
}
