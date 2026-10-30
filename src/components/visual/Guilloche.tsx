/**
 * Banknote-style guilloché rosette: layered rotated ellipses. Deterministic, so it is safe to
 * render on the server. Colour follows `currentColor`.
 */
export default function Guilloche({ className = "" }: { className?: string }) {
  const N = 48;
  const layer = (rx: number, ry: number, w: number, o: number) =>
    Array.from({ length: N }, (_, i) => (
      <ellipse
        key={`${rx}-${i}`}
        cx="200"
        cy="200"
        rx={rx}
        ry={ry}
        transform={`rotate(${(180 / N) * i} 200 200)`}
        strokeWidth={w}
        opacity={o}
      />
    ));
  return (
    <svg className={`guilloche ${className}`} viewBox="0 0 400 400" aria-hidden="true" fill="none" stroke="currentColor">
      <g className="g-a">{layer(186, 70, 0.7, 0.9)}</g>
      <g className="g-b">{layer(120, 34, 0.7, 0.75)}</g>
      <circle cx="200" cy="200" r="196" strokeWidth="1.4" />
      <circle cx="200" cy="200" r="58" strokeWidth="1.4" />
      <circle cx="200" cy="200" r="44" strokeWidth="0.8" strokeDasharray="2 4" />
    </svg>
  );
}
