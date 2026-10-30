/** Four-point chrome star with a metallic palette-only gradient (decorative). */
export default function IridescentStar({ className = "" }: { className?: string }) {
  return (
    <svg className={`iris ${className}`} viewBox="0 0 400 400" aria-hidden="true">
      <defs>
        <linearGradient id="iris-a" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#030303" />
          <stop offset=".22" stopColor="#e0e0e0" />
          <stop offset=".48" stopColor="#00ff66" />
          <stop offset=".74" stopColor="#ff5500" />
          <stop offset="1" stopColor="#030303" />
        </linearGradient>
        <radialGradient id="iris-b" cx=".35" cy=".3" r=".7">
          <stop offset="0" stopColor="#fff" stopOpacity=".8" />
          <stop offset=".4" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <path
        d="M200 10 C214 120 280 186 390 200 C280 214 214 280 200 390 C186 280 120 214 10 200 C120 186 186 120 200 10Z"
        fill="url(#iris-a)"
        stroke="#e0e0e0"
        strokeWidth="3"
      />
      <path
        d="M200 10 C214 120 280 186 390 200 C280 214 214 280 200 390 C186 280 120 214 10 200 C120 186 186 120 200 10Z"
        fill="url(#iris-b)"
      />
    </svg>
  );
}
