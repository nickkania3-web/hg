import WatchPartyDetailClient from "./WatchPartyDetailClient";

interface WatchPartyDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function WatchPartyDetailPage({
  params,
}: WatchPartyDetailPageProps) {
  const { id } = await params;
  return <WatchPartyDetailClient id={id} />;
}
