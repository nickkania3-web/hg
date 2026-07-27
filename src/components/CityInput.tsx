"use client";

interface CityInputProps {
  value: string;
  onChange: (city: string) => void;
}

export default function CityInput({ value, onChange }: CityInputProps) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-zinc-700">
        ...currently living in
      </span>
      <input
        type="text"
        className="rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-base text-zinc-900 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Chicago"
      />
    </label>
  );
}
