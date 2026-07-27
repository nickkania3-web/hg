"use client";

import type { TeamDTO } from "@/lib/types";

interface TeamPickerProps {
  teams: TeamDTO[];
  value: string;
  onChange: (teamId: string) => void;
}

export default function TeamPicker({ teams, value, onChange }: TeamPickerProps) {
  const grouped = teams.reduce<Record<string, TeamDTO[]>>((acc, team) => {
    (acc[team.sport] ??= []).push(team);
    return acc;
  }, {});

  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-zinc-700">I&apos;m a fan of...</span>
      <select
        className="rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-base text-zinc-900 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="" disabled>
          Select a team
        </option>
        {Object.entries(grouped).map(([sport, sportTeams]) => (
          <optgroup key={sport} label={sport}>
            {sportTeams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name} ({team.league})
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </label>
  );
}
