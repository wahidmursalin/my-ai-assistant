import { useTheme } from "../context/ThemeContext.jsx";

export default function ThemeToggle({ className = "" }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle dark/light mode"
      className={`flex items-center justify-center w-9 h-9 rounded-lg border border-night-border bg-night-card text-ink hover:border-brand-400 hover:scale-105 transition-all duration-200 ${className}`}
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}