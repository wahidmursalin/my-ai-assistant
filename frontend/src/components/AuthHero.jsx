import RobotMascot from "./RobotMascot.jsx";

const FEATURES = [
  { icon: "💬", label: "Chat", desc: "Ask anything" },
  { icon: "🧠", label: "Create", desc: "Generate ideas" },
  { icon: "⚡", label: "Learn", desc: "Grow your skills" },
];

export default function AuthHero({ eyebrow, heading, highlighted, description }) {
  return (
    <div className="relative z-10 max-w-lg">
      <span className="inline-block text-xs font-medium text-brand-200 bg-brand-500/15 border border-brand-400/30 rounded-full px-3.5 py-1.5">
        {eyebrow}
      </span>

      <h1 className="font-display text-4xl sm:text-5xl font-bold text-ink leading-[1.15] mt-5">
        {heading} <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-brand-400">{highlighted}</span>
      </h1>

      <p className="text-ink/50 mt-4 text-base max-w-md">{description}</p>

      <RobotMascot />

      <div className="grid grid-cols-3 gap-3 mt-2">
        {FEATURES.map((f) => (
          <div key={f.label} className="text-center">
            <div className="w-12 h-12 mx-auto rounded-xl bg-night-card border border-night-border flex items-center justify-center text-xl">
              {f.icon}
            </div>
            <div className="text-sm font-medium text-ink mt-2">{f.label}</div>
            <div className="text-xs text-ink/40">{f.desc}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 mt-8 text-sm text-ink/40">
        <span>🚀</span>
        <span>Smarter conversations. Brighter ideas.</span>
        <span className="flex-1 h-px bg-ink/10" />
      </div>
    </div>
  );
}