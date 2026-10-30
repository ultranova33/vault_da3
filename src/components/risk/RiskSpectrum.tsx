import type { RiskLevel } from "@/types/risk";

/** Horizontal 0–100 spectrum with zone boundaries at 30 and 65. */
export default function RiskSpectrum({ score, level }: { score: number; level: RiskLevel }) {
  return (
    <div className={`spec lvl-${level}`}>
      <div className="spec-bar" aria-hidden="true">
        <span className="spec-zone z-low" />
        <span className="spec-zone z-med" />
        <span className="spec-zone z-high" />
        <i className="spec-marker" style={{ left: `${Math.min(100, Math.max(0, score))}%` }} />
      </div>
      <div className="spec-labels" aria-hidden="true">
        <span>0</span>
        <span style={{ left: "30%" }}>30</span>
        <span style={{ left: "65%" }}>65</span>
        <span>100</span>
      </div>
    </div>
  );
}
