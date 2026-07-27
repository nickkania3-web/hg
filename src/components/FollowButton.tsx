"use client";

interface FollowButtonProps {
  isFollowing: boolean;
  onToggle: () => void;
}

export default function FollowButton({ isFollowing, onToggle }: FollowButtonProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
        isFollowing
          ? "border-zinc-900 bg-zinc-900 text-white hover:bg-zinc-700"
          : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-400"
      }`}
    >
      {isFollowing ? "Following" : "+ Follow team"}
    </button>
  );
}
