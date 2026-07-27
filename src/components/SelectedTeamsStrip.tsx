import TeamLogo from "@/components/TeamLogo";
import type { TeamDTO } from "@/lib/types";

interface SelectedTeamsStripProps {
  teams: TeamDTO[];
}

export default function SelectedTeamsStrip({ teams }: SelectedTeamsStripProps) {
  if (teams.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5">
      {teams.map((team) => (
        <TeamLogo key={team.id} logoUrl={team.logoUrl} name={team.name} size={28} />
      ))}
    </div>
  );
}
