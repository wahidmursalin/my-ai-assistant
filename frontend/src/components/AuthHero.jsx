import CatMascot from "./CatMascot.jsx";
import Icon from "./AuthIcons.jsx";

const FEATURES = [
  { icon: "chat", label: "Chat", desc: "Ask anything" },
  { icon: "bulb", label: "Create", desc: "Generate ideas" },
  { icon: "bolt", label: "Learn", desc: "Grow your skills" },
];

function Cross({ className = "", style }) {
  return (
    <svg viewBox="0 0 20 20" style={style} className={`absolute text-orange-400 animate-twinkle ${className}`} aria-hidden="true">
      <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

function Chevrons({ className = "" }) {
  return (
    <svg viewBox="0 0 24 28" className={`absolute text-amber-400 animate-twinkle ${className}`} aria-hidden="true">
      <path d="M4 12l8-8 8 8M4 22l8-8 8 8" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function AuthHero({ eyebrow, heading, highlighted, description }) {
  return (
    <div className="relative z-10 max-w-xl">
      <span className="inline-flex items-center gap-2 text-sm font-medium text-orange-600 dark:text-orange-300 bg-orange-100/60 dark:bg-orange-500/10 border border-orange-300 dark:border-orange-400/40 rounded-full px-4 py-1.5">
        <Icon name="sparkle" filled className="w-4 h-4" />
        {eyebrow}
      </span>

      <h1 className="font-display text-5xl xl:text-6xl font-extrabold text-ink leading-[1.05] tracking-tight mt-5">
        {heading} <span className="text-orange-500">{highlighted}</span>
      </h1>

      <p className="text-ink/60 mt-5 text-lg max-w-md leading-relaxed">{description}</p>

      {/* mascot */}
      <div className="relative w-64 h-72 mx-auto mt-2">
        <div className="absolute inset-8 rounded-full bg-orange-300/40 dark:bg-orange-500/15 blur-3xl" />
        <Cross className="w-6 h-6 top-12 left-0" />
        <Cross className="w-9 h-9 top-28 -left-6" />
        <Cross className="w-5 h-5 top-48 -left-2" style={{ animationDelay: "0.8s" }} />
        <Chevrons className="w-6 h-7 top-24 -right-6" />
        <Chevrons className="w-8 h-9 top-40 -right-10" />
        <CatMascot className="relative w-full h-full animate-float" />
      </div>

      <div className="grid grid-cols-3 gap-3 mt-4">
        {FEATURES.map((f) => (
          <div key={f.label} className="text-center">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-b from-orange-400 to-orange-500 text-white shadow-lg shadow-orange-500/30 flex items-center justify-center">
              <Icon name={f.icon} filled={f.icon !== "bulb"} className="w-6 h-6" />
            </div>
            <div className="text-[15px] font-semibold text-ink mt-2">{f.label}</div>
            <div className="text-sm text-ink/60">{f.desc}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 mt-8 text-[15px] text-ink/60">
        <Icon name="sparkle" filled className="w-5 h-5 text-orange-500" />
        <span>Smarter conversations. Brighter ideas.</span>
        <span className="flex-1 h-px bg-ink/15" />
      </div>
    </div>
  );
}