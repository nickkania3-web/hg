"use client";

import { useEffect, useState } from "react";
import type { FeaturedListDetailDTO, FeaturedListKey } from "@/lib/types";

interface FeaturedListModalProps {
  listKey: FeaturedListKey;
  city: string;
  onClose: () => void;
}

export default function FeaturedListModal({
  listKey,
  city,
  onClose,
}: FeaturedListModalProps) {
  const [detail, setDetail] = useState<FeaturedListDetailDTO | null>(null);

  useEffect(() => {
    let ignore = false;
    fetch(
      `/api/featured-lists/${encodeURIComponent(listKey)}?city=${encodeURIComponent(city)}`
    )
      .then((res) => res.json())
      .then((data: FeaturedListDetailDTO) => {
        if (!ignore) setDetail(data);
      });
    return () => {
      ignore = true;
    };
  }, [listKey, city]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-zinc-900">
          {detail ? detail.title : "Loading..."}
        </h2>
        <p className="text-sm text-zinc-500">{city}</p>

        <ol className="mt-4 flex flex-col gap-2">
          {detail?.items.map((item, i) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200 p-3"
            >
              <span className="text-sm text-zinc-900">
                <span className="mr-2 font-semibold text-zinc-400">
                  {i + 1}
                </span>
                {item.primaryText}
              </span>
              <span className="shrink-0 text-sm text-zinc-500">
                {item.secondaryText}
              </span>
            </li>
          ))}
        </ol>

        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Close
        </button>
      </div>
    </div>
  );
}
