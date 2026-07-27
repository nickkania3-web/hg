"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import { getDeviceId } from "@/lib/deviceId";
import type { ProfileDTO } from "@/lib/types";

const DEFAULT_CITY = "Chicago";

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileDTO | null>(null);

  useEffect(() => {
    let ignore = false;
    const deviceId = getDeviceId();

    fetch(`/api/profile?deviceId=${encodeURIComponent(deviceId)}`)
      .then((res) => res.json())
      .then((data: ProfileDTO) => {
        if (!ignore) setProfile(data);
      });

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="flex flex-1 flex-col bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Logo />
            </Link>
            <div>
              <Link href="/" className="text-sm text-zinc-500 hover:text-brand">
                &larr; Home
              </Link>
              <h1 className="text-xl font-bold text-zinc-900">My Profile</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/timeline"
              className="text-sm text-zinc-500 hover:text-brand"
            >
              Timeline
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

      <div className="mx-auto w-full max-w-4xl flex-1 px-6 py-8">
        {!profile ? (
          <p className="text-zinc-500">Loading profile...</p>
        ) : (
          <div className="flex flex-col gap-8">
            <StatsSection profile={profile} />
            <TeamsSection teams={profile.teams} />
            <FavoritesSection favorites={profile.favoriteBars} />
            <VisitedSection visited={profile.visited} />
          </div>
        )}
      </div>
    </div>
  );
}

function StatsSection({ profile }: { profile: ProfileDTO }) {
  const { stats } = profile;
  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatCard label="Verifications submitted" value={stats.totalVerifications} />
      <StatCard label="Teams followed" value={stats.teamsFollowedCount} />
      <StatCard
        label="Most-visited bar"
        value={stats.mostVisitedBar ? stats.mostVisitedBar.barName : "—"}
        sub={
          stats.mostVisitedBar
            ? `${stats.mostVisitedBar.visitCount} visit${
                stats.mostVisitedBar.visitCount === 1 ? "" : "s"
              }`
            : undefined
        }
      />
    </section>
  );
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-1 truncate text-2xl font-bold text-zinc-900">{value}</p>
      {sub && <p className="text-sm text-zinc-500">{sub}</p>}
    </div>
  );
}

function TeamsSection({ teams }: { teams: ProfileDTO["teams"] }) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-zinc-900">My Teams</h2>
      {teams.length === 0 ? (
        <p className="mt-2 text-sm text-zinc-500">
          You&apos;re not following any teams yet. Follow a team from its
          search page to see it here.
        </p>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          {teams.map((team) => (
            <Link
              key={team.id}
              href={`/search?teamId=${encodeURIComponent(
                team.id
              )}&city=${encodeURIComponent(DEFAULT_CITY)}`}
              className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:border-brand"
            >
              {team.name}{" "}
              <span className="text-zinc-400">({team.sport})</span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

function FavoritesSection({
  favorites,
}: {
  favorites: ProfileDTO["favoriteBars"];
}) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-zinc-900">Favorite Bars</h2>
      {favorites.length === 0 ? (
        <p className="mt-2 text-sm text-zinc-500">
          No favorite bars saved yet. Star a bar from the search results to
          save it here.
        </p>
      ) : (
        <div className="mt-3 flex flex-col gap-2">
          {favorites.map((bar) => (
            <div
              key={bar.id}
              className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-4"
            >
              <div>
                <p className="font-medium text-zinc-900">
                  <span className="mr-1 text-amber-500">★</span>
                  {bar.name}
                </p>
                <p className="text-sm text-zinc-500">{bar.address}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function VisitedSection({ visited }: { visited: ProfileDTO["visited"] }) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-zinc-900">Visited Bars</h2>
      {visited.length === 0 ? (
        <p className="mt-2 text-sm text-zinc-500">
          No check-ins yet. Submit &quot;I watched here&quot; from a bar in
          search results to build your history.
        </p>
      ) : (
        <div className="mt-3 flex flex-col gap-6">
          {visited.map((group) => (
            <div key={group.teamId}>
              <h3 className="text-sm font-semibold text-zinc-700">
                {group.teamName}{" "}
                <span className="font-normal text-zinc-400">
                  ({group.sport})
                </span>
              </h3>
              <div className="mt-2 flex flex-col gap-2">
                {group.bars.map((bar) => (
                  <div
                    key={bar.barId}
                    className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-3"
                  >
                    <span className="font-medium text-zinc-900">
                      {bar.barName}
                    </span>
                    <span className="text-sm text-zinc-500">
                      {bar.visitCount} visit{bar.visitCount === 1 ? "" : "s"}{" "}
                      · last{" "}
                      {new Date(bar.lastVisitedAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
