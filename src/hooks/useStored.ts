"use client";

import { useMemo, useSyncExternalStore } from "react";
import type { CredentialRecord, HistoryEntry, SessionRecord, SimEvent } from "@/types/auth";
import type { RiskLevel } from "@/types/risk";
import { KEYS, getRaw, parse, subscribe } from "@/lib/simulation/store";

type Key = (typeof KEYS)[keyof typeof KEYS];

function useStored<T>(key: Key, fallback: T): T {
  const raw = useSyncExternalStore(
    subscribe,
    () => getRaw(key),
    () => null,
  );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => parse(raw, fallback), [raw]);
}

const noopSubscribe = () => () => {};

/** false during SSR and the hydration pass, true afterwards. */
export function useHydrated(): boolean {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}

const NO_CREDENTIALS: Record<string, CredentialRecord> = {};
const NO_HISTORY: HistoryEntry[] = [];
const NO_EVENTS: SimEvent[] = [];

export const useSession = () => useStored<SessionRecord | null>(KEYS.session, null);
export const useCredentials = () => useStored(KEYS.credentials, NO_CREDENTIALS);
export const useHistory = () => useStored(KEYS.history, NO_HISTORY);
export const useEventLog = () => useStored(KEYS.events, NO_EVENTS);
export const useScenario = () => useStored<RiskLevel>(KEYS.scenario, "low");
