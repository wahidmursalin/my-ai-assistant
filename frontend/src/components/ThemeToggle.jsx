import { useTheme } from "../context/ThemeContext.jsx";
import Icon from "./AuthIcons.jsx";

export default function ThemeToggle({ className = "" }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle dark/light mode"
      className={`flex items-center justify-center w-10 h-10 shrink-0 rounded-xl border border-night-border bg-night-input text-orange-500 hover:scale-105 transition-transform ${className}`}
    >
      <Icon name={theme === "dark" ? "moon" : "sun"} className="w-5 h-5" />
    </button>
  );
}