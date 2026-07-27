"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import TeamPicker from "@/components/TeamPicker";
import CityInput from "@/components/CityInput";
import Logo from "@/components/Logo";
import type { TeamDTO } from "@/lib/types";

export default function Home() {
  const router = useRouter();
  const [teams, setTeams] = useState<TeamDTO[]>([]);
  const [teamId, setTeamId] = useState("");
  const [city, setCity] = useState("Chicago");

  useEffect(() => {
    fetch("/api/teams")
      .then((res) => res.json())
      .then(setTeams)
      .catch(() => setTeams([]));
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!teamId || !city.trim()) return;
    router.push(
      `/search?teamId=${encodeURIComponent(teamId)}&city=${encodeURIComponent(
        city.trim()
      )}`
    );
  }

  return (
    <div className="flex flex-1 flex-col bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <Link href="/">
            <Logo />
          </Link>
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

      <div className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-brand">
              HomeGame
            </h1>
            <p className="mt-2 text-zinc-600">
              Find where your team&apos;s fans actually watch the game.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-5 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
          >
            <TeamPicker teams={teams} value={teamId} onChange={setTeamId} />
            <CityInput value={city} onChange={setCity} />

            <button
              type="submit"
              disabled={!teamId || !city.trim()}
              className="mt-2 rounded-lg bg-brand px-4 py-2.5 text-base font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-zinc-300"
            >
              Find fan bars
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-500">
            Seeded for Chicago — try Michigan State, Notre Dame, or the Packers.
          </p>
        </div>
      </div>
    </div>
  );
}
