"use client";

import { useHydrated, useScenario, useSession } from "@/hooks/useStored";

/** Security status indicator for the gateway: reflects live (simulated) state. */
export default function StatusBadge() {
  const hydrated = useHydrated();
  const session = useSession();
  const scenario = useScenario();
  const active = hydrated && !!session;
  return (
    <ul className="status" aria-label="System status">
      <li>
        <span>CORE</span>
        <b className="ok">ARMED</b>
      </li>
      <li>
        <span>SESSION</span>
        <b className={active ? "ok" : ""}>{active ? "ACTIVE (DEMO)" : "NONE"}</b>
      </li>
      <li>
        <span>CONTEXT</span>
        <b className={`lvl-${scenario} lvl-word`}>{hydrated ? scenario.toUpperCase() : "—"}</b>
      </li>
    </ul>
  );
}
