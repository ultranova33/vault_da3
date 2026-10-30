import type { RiskSignal } from "@/types/risk";

export default function SignalList({ signals }: { signals: RiskSignal[] }) {
  return (
    <ul className="sig">
      {signals.map((s) => (
        <li key={s.id} className={`sig-row sig-${s.status}`}>
          <span className="sig-label">{s.label}</span>
          <span className="sig-value">{s.value}</span>
          <span className="sig-status">{s.status.toUpperCase()}</span>
          <span className="sig-bar" aria-hidden="true">
            <i style={{ width: `${Math.min(100, (s.weight / 28) * 100)}%` }} />
          </span>
          <span className="sig-weight">+{s.weight}</span>
        </li>
      ))}
    </ul>
  );
}
