// A small, original, hand-drawn mascot (no external image/IP) used on the auth hero panel.
export default function RobotMascot() {
  return (
    <div className="relative w-64 h-64 mx-auto">
      {/* Orbit ring */}
      <div className="absolute inset-0 rounded-full border border-brand-400/20" style={{ transform: "rotate(-18deg)" }} />

      {/* Glow halo */}
      <div className="absolute inset-6 rounded-full bg-brand-500/20 blur-2xl" />

      {/* Sparkles */}
      <span className="absolute top-2 left-8 text-fuchsia-300 text-lg animate-twinkle">✦</span>
      <span className="absolute top-16 right-2 text-brand-300 text-sm animate-twinkle" style={{ animationDelay: "0.6s" }}>✦</span>
      <span className="absolute bottom-10 right-10 text-fuchsia-300 text-base animate-twinkle" style={{ animationDelay: "1.2s" }}>✦</span>

      <svg viewBox="0 0 200 200" className="relative w-full h-full animate-float">
        <defs>
          <linearGradient id="botBody" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f5f3ff" />
            <stop offset="100%" stopColor="#c4b5fd" />
          </linearGradient>
          <linearGradient id="botScreen" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4c1d95" />
            <stop offset="100%" stopColor="#2e1065" />
          </linearGradient>
        </defs>

        {/* antenna */}
        <line x1="100" y1="30" x2="100" y2="48" stroke="#c4b5fd" strokeWidth="3" strokeLinecap="round" />
        <circle cx="100" cy="24" r="7" fill="url(#botBody)" />

        {/* head */}
        <rect x="55" y="48" width="90" height="72" rx="26" fill="url(#botBody)" />
        {/* screen */}
        <rect x="68" y="64" width="64" height="42" rx="16" fill="url(#botScreen)" />
        {/* eyes */}
        <ellipse cx="90" cy="85" rx="6" ry="8" fill="#a78bfa" />
        <ellipse cx="112" cy="85" rx="6" ry="8" fill="#a78bfa" />
        {/* smile */}
        <path d="M92 95 Q100 101 108 95" stroke="#c4b5fd" strokeWidth="2.5" fill="none" strokeLinecap="round" />

        {/* ears */}
        <rect x="42" y="72" width="12" height="24" rx="6" fill="url(#botBody)" />
        <rect x="146" y="72" width="12" height="24" rx="6" fill="url(#botBody)" />

        {/* body */}
        <path d="M70 122 h60 a10 10 0 0 1 10 10 v14 a40 40 0 0 1 -80 0 v-14 a10 10 0 0 1 10 -10 z" fill="url(#botBody)" />
        <circle cx="100" cy="140" r="9" fill="url(#botScreen)" />

        {/* speech bubble */}
        <g transform="translate(18,128)">
          <rect x="0" y="0" width="44" height="30" rx="12" fill="#2e1065" opacity="0.85" />
          <path d="M10 30 L4 40 L20 30 Z" fill="#2e1065" opacity="0.85" />
          <circle cx="12" cy="15" r="3" fill="#c4b5fd" />
          <circle cx="22" cy="15" r="3" fill="#c4b5fd" />
          <circle cx="32" cy="15" r="3" fill="#c4b5fd" />
        </g>
      </svg>
    </div>
  );
}