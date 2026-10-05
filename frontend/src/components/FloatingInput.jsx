import { useState } from "react";

// A Material-style "floating label" input: the label sits inside the box like
// a placeholder until the field is focused or filled, then it animates up to
// rest right on the border line (with a small background patch that masks
// the border beneath it, so it looks like a proper notch).
export default function FloatingInput({
  icon,
  label,
  type = "text",
  value,
  onChange,
  required,
  rightElement,
}) {
  const [focused, setFocused] = useState(false);
  const floated = focused || (value && value.length > 0);

  return (
    <div
      className={`relative mb-4 transition-transform duration-200 ${focused ? "scale-[1.015]" : "scale-100"}`}
    >
      {icon && (
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/30 pointer-events-none z-10">
          {icon}
        </span>
      )}

      <input
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        required={required}
        className={`w-full ${icon ? "pl-10" : "pl-3.5"} ${rightElement ? "pr-10" : "pr-3.5"} pt-4 pb-1.5 bg-night-input border rounded-lg text-sm text-ink outline-none transition-all duration-200 ${
          focused ? "border-brand-500 shadow-[0_0_0_3px_rgba(124,58,237,0.18)]" : "border-night-border"
        }`}
      />

      <label
        className={`absolute bg-night-input px-1 pointer-events-none transition-all duration-200 ${
          icon ? "left-9" : "left-2.5"
        } ${
          floated
            ? "-top-2 text-[11px] font-medium text-brand-400"
            : "top-1/2 -translate-y-1/2 text-sm text-ink/40"
        }`}
      >
        {label}
      </label>

      {rightElement}
    </div>
  );
}