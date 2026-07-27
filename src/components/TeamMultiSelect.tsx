"use client";

import TeamLogo from "@/components/TeamLogo";
import type { TeamDTO } from "@/lib/types";

interface TeamMultiSelectProps {
  teams: TeamDTO[];
  selectedTeamIds: Set<string>;
  onToggle: (teamId: string) => void;
}

export default function TeamMultiSelect({
  teams,
  selectedTeamIds,
  onToggle,
}: TeamMultiSelectProps) {
  const grouped = teams.reduce<Record<string, TeamDTO[]>>((acc, team) => {
    (acc[team.sport] ??= []).push(team);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-4">
      {Object.entries(grouped).map(([sport, sportTeams]) => (
        <div key={sport}>
          <p className="mb-2 text-sm font-medium text-zinc-500">{sport}</p>
          <div className="flex flex-wrap gap-2">
            {sportTeams.map((team) => {
              const isSelected = selectedTeamIds.has(team.id);
              return (
                <button
                  key={team.id}
                  type="button"
                  onClick={() => onToggle(team.id)}
                  aria-pressed={isSelected}
                  className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                    isSelected
                      ? "border-brand bg-brand text-white"
                      : "border-zinc-300 bg-white text-zinc-700 hover:border-brand"
                  }`}
                >
                  <TeamLogo logoUrl={team.logoUrl} name={team.name} size={20} />
                  {team.name}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
