import { useState } from "react";
import Icon from "./AuthIcons.jsx";

// Auth-page input with a floating label: the label sits inside the box like a
// placeholder until the field is focused or filled, then it moves up onto the
// top border (a small background patch masks the border behind it).
// Passing type="password" automatically adds the show/hide eye toggle.
export default function AuthInput({ icon, label, type = "text", value, onChange, required }) {
  const isPassword = type === "password";
  const [show, setShow] = useState(false);
  const [focused, setFocused] = useState(false);
  const floated = focused || (value && value.length > 0);

  return (
    <div className={`relative mb-3.5 transition-transform duration-200 ${focused ? "scale-[1.015]" : "scale-100"}`}>
      <span
        className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10 transition-colors ${
          focused ? "text-orange-500" : "text-ink/50"
        }`}
      >
        <Icon name={icon} className="w-[18px] h-[18px]" />
      </span>

      <input
        type={isPassword && show ? "text" : type}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        required={required}
        aria-label={label}
        className={`w-full h-12 pl-11 ${isPassword ? "pr-11" : "pr-4"} bg-night-input border rounded-xl text-sm text-ink outline-none transition-all duration-200 ${
          focused
            ? "border-orange-400 ring-4 ring-orange-400/20"
            : "border-night-border"
        }`}
      />

      <label
        className={`absolute left-10 px-1.5 pointer-events-none transition-all duration-200 bg-night-input ${
          floated
            ? "-top-2 text-[11px] font-semibold text-orange-500"
            : "top-1/2 -translate-y-1/2 text-sm text-ink/40"
        }`}
      >
        {label}
      </label>

      {isPassword && (
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 z-10 text-ink/60 hover:text-orange-500 transition-colors"
        >
          <Icon name={show ? "eye" : "eyeOff"} className="w-[18px] h-[18px]" />
        </button>
      )}
    </div>
  );
}