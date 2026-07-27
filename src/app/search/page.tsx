import Link from "next/link";
import SearchClient from "./SearchClient";

interface SearchPageProps {
  searchParams: Promise<{ teamId?: string; city?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { teamId, city } = await searchParams;

  if (!teamId || !city) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-center text-zinc-500">
        Missing team or city.{" "}
        <Link href="/" className="underline">
          Start a new search
        </Link>
        .
      </div>
    );
  }

  return <SearchClient teamId={teamId} city={city} />;
}
