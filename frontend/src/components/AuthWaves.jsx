// Decorative gradient waves for the auth pages background. Pure SVG/CSS, no external assets.
export default function AuthWaves() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <svg
        className="absolute -bottom-24 -left-20 w-[140%] max-w-none opacity-70"
        viewBox="0 0 1200 500"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="wave1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#312e81" />
          </linearGradient>
          <linearGradient id="wave2" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>
        <path d="M0,320 C250,220 420,420 700,340 C900,290 1050,360 1200,300 L1200,500 L0,500 Z" fill="url(#wave1)" opacity="0.45" />
        <path d="M0,380 C300,300 500,460 800,380 C950,340 1080,420 1200,380 L1200,500 L0,500 Z" fill="url(#wave2)" opacity="0.35" />
      </svg>

      <div className="absolute top-1/3 right-0 w-[420px] h-[420px] rounded-full bg-brand-500/20 blur-[110px]" />
      <div className="absolute -top-16 right-1/4 w-[260px] h-[260px] rounded-full bg-fuchsia-500/10 blur-[90px]" />
    </div>
  );
}