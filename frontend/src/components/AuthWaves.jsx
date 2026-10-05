// Decorative warm gradient background + waves for the auth pages. Pure SVG/CSS.
export default function AuthWaves() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* soft light blobs */}
      <div className="absolute -top-32 -right-24 w-[560px] h-[560px] rounded-full bg-orange-200/60 dark:bg-orange-500/10 blur-[110px]" />
      <div className="absolute top-1/3 -left-32 w-[420px] h-[420px] rounded-full bg-amber-200/50 dark:bg-amber-500/10 blur-[110px]" />

      <svg
        className="absolute bottom-0 left-0 w-full h-[55%]"
        viewBox="0 0 1200 500"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="waveA" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fdba74" />
            <stop offset="100%" stopColor="#fb923c" />
          </linearGradient>
          <linearGradient id="waveB" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#fed7aa" />
            <stop offset="100%" stopColor="#fdba74" />
          </linearGradient>
        </defs>
        <g className="opacity-60 dark:opacity-25">
          <path d="M0,260 C220,170 430,330 700,270 C930,220 1060,300 1200,240 L1200,500 L0,500 Z" fill="url(#waveB)" />
          <path d="M0,350 C260,280 520,420 820,340 C980,300 1090,360 1200,330 L1200,500 L0,500 Z" fill="url(#waveA)" />
        </g>
      </svg>
    </div>
  );
}