"use client";

interface RsvpButtonProps {
  isRsvpd: boolean;
  disabled?: boolean;
  onToggle: () => void;
}

export default function RsvpButton({ isRsvpd, disabled, onToggle }: RsvpButtonProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-400 ${
        isRsvpd
          ? "border border-zinc-300 bg-white text-zinc-700 hover:border-zinc-400"
          : "bg-zinc-900 text-white hover:bg-zinc-700"
      }`}
    >
      {isRsvpd ? "You're going — cancel RSVP" : "RSVP to this watch party"}
    </button>
  );
}
