"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import FeedEntry from "@/components/FeedEntry";
import type { FeedEntryDTO, FeedPageDTO } from "@/lib/types";

export default function TimelinePage() {
  const [entries, setEntries] = useState<FeedEntryDTO[] | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const loadMore = useCallback(async (cursor: string) => {
    setLoadingMore(true);
    const res = await fetch(`/api/feed?cursor=${encodeURIComponent(cursor)}`);
    const data: FeedPageDTO = await res.json();
    setEntries((prev) => (prev ? [...prev, ...data.entries] : data.entries));
    setNextCursor(data.nextCursor);
    setLoadingMore(false);
  }, []);

  useEffect(() => {
    let ignore = false;
    fetch("/api/feed")
      .then((res) => res.json())
      .then((data: FeedPageDTO) => {
        if (ignore) return;
        setEntries(data.entries);
        setNextCursor(data.nextCursor);
      });
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (observedEntries) => {
        if (observedEntries[0].isIntersecting && nextCursor && !loadingMore) {
          loadMore(nextCursor);
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [nextCursor, loadingMore, loadMore]);

  const loading = entries === null;

  return (
    <div className="flex flex-1 flex-col bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-2xl items-center gap-4">
          <Link href="/">
            <Logo />
          </Link>
          <div>
            <Link href="/" className="text-sm text-zinc-500 hover:text-brand">
              &larr; Home
            </Link>
            <h1 className="text-xl font-bold text-zinc-900">Timeline</h1>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-8">
        {loading ? (
          <p className="text-zinc-500">Loading activity...</p>
        ) : entries.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-zinc-500">
            No activity yet.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {entries.map((entry) => (
              <FeedEntry key={entry.id} entry={entry} />
            ))}
          </div>
        )}

        <div ref={sentinelRef} className="h-1" />

        {loadingMore && (
          <p className="mt-4 text-center text-sm text-zinc-400">
            Loading more...
          </p>
        )}
      </div>
    </div>
  );
}
