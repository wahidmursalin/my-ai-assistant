// Original hand-drawn robot-cat mascot (pure SVG, no external image).
// headOnly crops to the face, used as the small logo on the form card.
import { useId } from "react";

export default function CatMascot({ headOnly = false, className = "" }) {
  // Unique gradient ids per instance: duplicate ids break when the first copy is display:none
  const uid = useId().replace(/:/g, "");
  const white = `catWhite${uid}`;
  const screen = `catScreen${uid}`;
  const orange = `catOrange${uid}`;
  return (
    <svg
      viewBox={headOnly ? "36 20 188 160" : "0 0 260 300"}
      className={className}
      role="img"
      aria-label="Robot cat mascot"
    >
      <defs>
        <linearGradient id={white} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#ffe8d1" />
        </linearGradient>
        <linearGradient id={screen} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#67e8f9" />
          <stop offset="100%" stopColor="#0ea5e9" />
        </linearGradient>
        <linearGradient id={orange} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fb923c" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>
      </defs>

      {/* tail */}
      {!headOnly && (
        <path d="M160 228 C204 234 220 212 208 186" stroke={`url(#${orange})`} strokeWidth="9" strokeLinecap="round" fill="none" />
      )}

      {/* ears */}
      <path d="M66 86 C58 58 60 36 70 28 C75 24 81 26 86 30 L114 58 Z" fill={`url(#${orange})`} />
      <path d="M194 86 C202 58 200 36 190 28 C185 24 179 26 174 30 L146 58 Z" fill={`url(#${orange})`} />
      <path d="M74 70 C72 54 73 42 77 38 L96 56 Z" fill="#fed7aa" />
      <path d="M186 70 C188 54 187 42 183 38 L164 56 Z" fill="#fed7aa" />

      {/* body */}
      {!headOnly && (
        <g>
          <line x1="112" y1="232" x2="104" y2="256" stroke="#1f2937" strokeWidth="12" strokeLinecap="round" />
          <line x1="148" y1="232" x2="158" y2="254" stroke="#1f2937" strokeWidth="12" strokeLinecap="round" />
          <ellipse cx="99" cy="266" rx="19" ry="10" fill="#fdba74" />
          <ellipse cx="165" cy="263" rx="19" ry="10" fill="#fdba74" />

          <line x1="100" y1="192" x2="68" y2="208" stroke="#1f2937" strokeWidth="12" strokeLinecap="round" />
          <line x1="160" y1="192" x2="194" y2="176" stroke="#1f2937" strokeWidth="12" strokeLinecap="round" />
          <circle cx="60" cy="210" r="11" fill="#fb923c" />
          <circle cx="202" cy="172" r="11" fill="#fb923c" />

          <rect x="96" y="172" width="68" height="66" rx="28" fill={`url(#${white})`} />
          <path d="M112 186 h36 l-6 26 q-12 8 -24 0 z" fill={`url(#${orange})`} />
        </g>
      )}

      {/* headphones */}
      <rect x="42" y="100" width="24" height="52" rx="12" fill={`url(#${orange})`} />
      <rect x="194" y="100" width="24" height="52" rx="12" fill={`url(#${orange})`} />

      {/* head */}
      <rect x="56" y="58" width="148" height="120" rx="50" fill={`url(#${white})`} />

      {/* screen face */}
      <rect x="70" y="72" width="120" height="92" rx="38" fill={`url(#${screen})`} stroke="#0369a1" strokeWidth="3" />
      <ellipse cx="102" cy="86" rx="22" ry="7" fill="#fff" opacity="0.35" />

      {/* happy eyes */}
      <path d="M96 114 Q106 100 118 114" stroke="#0c4a6e" strokeWidth="4.5" strokeLinecap="round" fill="none" />
      <path d="M142 114 Q154 100 164 114" stroke="#0c4a6e" strokeWidth="4.5" strokeLinecap="round" fill="none" />

      {/* open mouth + tongue */}
      <path d="M112 128 Q130 156 148 128 Z" fill="#0c4a6e" />
      <ellipse cx="130" cy="141" rx="9" ry="6" fill="#fb7185" />

      {/* whiskers */}
      <g stroke="#bae6fd" strokeWidth="2.5" strokeLinecap="round">
        <line x1="80" y1="124" x2="96" y2="127" />
        <line x1="80" y1="136" x2="96" y2="133" />
        <line x1="180" y1="124" x2="164" y2="127" />
        <line x1="180" y1="136" x2="164" y2="133" />
      </g>
    </svg>
  );
}