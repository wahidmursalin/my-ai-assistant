export function StarIcon({ filled, className = "w-6 h-6" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
      <path d="M12 3.5l2.6 5.3 5.9.9-4.25 4.15 1 5.85L12 16.9l-5.25 2.8 1-5.85L3.5 9.7l5.9-.9L12 3.5z" />
    </svg>
  );
}

// Read-only stars (used on the admin page).
export function StarRow({ value, className = "w-4 h-4" }) {
  return (
    <span className="inline-flex text-amber-400">
      {[1, 2, 3, 4, 5].map((n) => (
        <StarIcon key={n} filled={n <= Math.round(value)} className={className} />
      ))}
    </span>
  );
}