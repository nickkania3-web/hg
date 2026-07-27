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
          ? "border-brand bg-brand text-white hover:bg-brand-dark"
          : "border-zinc-300 bg-white text-zinc-700 hover:border-brand"
      }`}
    >
      {isFollowing ? "Following" : "+ Follow team"}
    </button>
  );
}
