import type { RiskLevel } from "@/types/risk";

const R = 88;
const C = 2 * Math.PI * R;
const ARC = C * 0.75;

/** 270° circular gauge. `score` may be fractional (animated). */
export default function RiskGauge({ score, level }: { score: number; level: RiskLevel }) {
  const shown = Math.round(score);
  const tick = (v: number) => -225 + 270 * (v / 100);
  return (
    <div className={`gauge lvl-${level}`} role="img" aria-label={`Risk score ${shown} out of 100, ${level} risk`}>
      <svg viewBox="0 0 220 220" aria-hidden="true">
        <g transform="rotate(135 110 110)">
          <circle cx="110" cy="110" r={R} className="gauge-track" strokeDasharray={`${ARC} ${C}`} />
          <circle
            cx="110"
            cy="110"
            r={R}
            className="gauge-fill"
            strokeDasharray={`${(ARC * Math.min(100, score)) / 100} ${C}`}
          />
        </g>
        {[30, 65].map((v) => (
          <line
            key={v}
            x1="110"
            y1="14"
            x2="110"
            y2="30"
            className="gauge-tick"
            transform={`rotate(${tick(v) + 90} 110 110)`}
          />
        ))}
        <circle cx="110" cy="110" r="64" className="gauge-inner" />
      </svg>
      <div className="gauge-read">
        <strong>{String(shown).padStart(2, "0")}</strong>
        <span>/100</span>
        <em>{level.toUpperCase()}</em>
      </div>
    </div>
  );
}
