"use client";

import type { RiskLevel } from "@/types/risk";
import { LEVELS, SCENARIO_META } from "@/lib/simulation/risk-engine";

export default function ScenarioSwitch({
  value,
  onChange,
  disabled = false,
  compact = false,
}: {
  value: RiskLevel;
  onChange: (l: RiskLevel) => void;
  disabled?: boolean;
  compact?: boolean;
}) {
  return (
    <div className={`scn ${compact ? "scn--compact" : ""}`} role="radiogroup" aria-label="Risk scenario">
      {LEVELS.map((l) => {
        const m = SCENARIO_META[l];
        const on = value === l;
        return (
          <button
            key={l}
            type="button"
            role="radio"
            aria-checked={on}
            disabled={disabled}
            className={`scn-btn lvl-${l} ${on ? "is-on" : ""}`}
            onClick={() => onChange(l)}
          >
            <span className="scn-code">{m.code}</span>
            <span className="scn-name">{l.toUpperCase()}</span>
            {!compact && <span className="scn-sub">{m.title}</span>}
            <span className="scn-range">{m.range}</span>
          </button>
        );
      })}
    </div>
  );
}
