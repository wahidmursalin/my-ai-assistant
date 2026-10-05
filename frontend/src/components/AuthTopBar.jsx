import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext.jsx";
import Icon from "./AuthIcons.jsx";

export default function AuthTopBar({ prompt, to, cta }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="relative z-10 flex items-center justify-between px-6 sm:px-10 py-6">
      <div className="font-display font-extrabold text-2xl text-ink tracking-tight">
        Custom <span className="text-orange-500">AI</span>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={toggleTheme}
          aria-label="Toggle dark/light mode"
          className="flex items-center justify-center w-10 h-10 rounded-xl border border-night-border bg-night-card/70 text-orange-500 hover:scale-105 transition-transform"
        >
          <Icon name={theme === "dark" ? "moon" : "sun"} className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-4 text-[15px] text-ink/70">
          {prompt}
          <Link
            to={to}
            className="font-semibold text-orange-600 dark:text-orange-400 border border-orange-400 rounded-xl px-4 py-2 bg-night-card/40 hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-colors"
          >
            {cta} →
          </Link>
        </div>
      </div>
    </div>
  );
}