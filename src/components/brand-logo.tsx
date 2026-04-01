type BrandLogoProps = {
  /** Show wordmark next to the mark */
  showWordmark?: boolean;
  className?: string;
};

export function BrandLogo({ showWordmark = true, className = "" }: BrandLogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        className="h-9 w-9 shrink-0 sm:h-10 sm:w-10"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <defs>
          <linearGradient id="hive-glow" x1="8" y1="4" x2="44" y2="48" gradientUnits="userSpaceOnUse">
            <stop stopColor="#34d399" />
            <stop offset="0.45" stopColor="#2dd4bf" />
            <stop offset="1" stopColor="#6366f1" />
          </linearGradient>
          <linearGradient id="hive-core" x1="24" y1="12" x2="24" y2="36" gradientUnits="userSpaceOnUse">
            <stop stopColor="#a7f3d0" />
            <stop offset="1" stopColor="#5eead4" />
          </linearGradient>
          <filter id="hive-soft" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="0.8" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Outer hive cell */}
        <path
          d="M24 3L42.5 13.5V34.5L24 45L5.5 34.5V13.5L24 3Z"
          stroke="url(#hive-glow)"
          strokeWidth="1.75"
          strokeLinejoin="round"
          fill="rgba(6, 24, 18, 0.55)"
        />
        {/* Inner hex accent */}
        <path
          d="M24 10L35 16.5V29.5L24 36L13 29.5V16.5L24 10Z"
          stroke="url(#hive-glow)"
          strokeWidth="1"
          strokeOpacity="0.45"
          fill="none"
        />
        {/* Stylized "H" as circuit traces */}
        <path
          d="M16 17V31M32 17V31M16 24H32"
          stroke="url(#hive-core)"
          strokeWidth="2.25"
          strokeLinecap="round"
          filter="url(#hive-soft)"
        />
        {/* Nodes */}
        <circle cx="16" cy="17" r="2.25" fill="url(#hive-glow)" />
        <circle cx="16" cy="31" r="2.25" fill="url(#hive-glow)" />
        <circle cx="32" cy="17" r="2.25" fill="url(#hive-glow)" />
        <circle cx="32" cy="31" r="2.25" fill="url(#hive-glow)" />
        <circle cx="24" cy="24" r="2.75" fill="#fbbf24" opacity="0.95" />
      </svg>
      {showWordmark && (
        <span className="flex flex-col leading-tight">
          <span className="text-base font-semibold tracking-tight text-white sm:text-lg">
            Hive Tech
          </span>
          <span className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-emerald-400/95 sm:text-[0.7rem]">
            Forum
          </span>
        </span>
      )}
    </span>
  );
}
