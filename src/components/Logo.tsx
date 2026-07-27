interface LogoProps {
  iconClassName?: string;
  wordmarkClassName?: string;
  showWordmark?: boolean;
}

export default function Logo({
  iconClassName = "h-7 w-7 text-brand",
  wordmarkClassName = "text-lg font-bold text-brand",
  showWordmark = true,
}: LogoProps) {
  return (
    <span className="inline-flex items-center gap-2">
      <svg viewBox="0 0 24 24" className={iconClassName} fill="none">
        <path
          d="M5 3h14a2 2 0 0 1 2 2v7c0 5-4.5 8.5-9 10-4.5-1.5-9-5-9-10V5a2 2 0 0 1 2-2Z"
          fill="currentColor"
        />
        <circle cx="12" cy="10" r="3" fill="var(--color-brand-cream)" />
      </svg>
      {showWordmark && <span className={wordmarkClassName}>HomeGame</span>}
    </span>
  );
}
