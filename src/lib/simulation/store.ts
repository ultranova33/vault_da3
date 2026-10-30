import type {
  CredentialRecord,
  HistoryEntry,
  SessionRecord,
  SimEvent,
} from "@/types/auth";
import type { RiskLevel } from "@/types/risk";
import { generateId } from "./challenge";

/** sessionStorage-backed demo state. Cleared when the tab closes. Not secure storage. */

export const KEYS = {
  credentials: "nk.credentials",
  session: "nk.session",
  history: "nk.history",
  events: "nk.events",
  scenario: "nk.scenario",
} as const;

type Key = (typeof KEYS)[keyof typeof KEYS];

const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

export function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

export function getRaw(key: Key): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return memory[key] ?? null;
  }
}

/** Fallback if sessionStorage is blocked (private mode, strict settings). */
const memory: Partial<Record<Key, string | null>> = {};

function setRaw(key: Key, value: string | null) {
  try {
    if (value === null) sessionStorage.removeItem(key);
    else sessionStorage.setItem(key, value);
  } catch {
    memory[key] = value;
  }
  notify();
}

export function parse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

const read = <T>(key: Key, fallback: T) => parse(getRaw(key), fallback);

/* credentials */
export const getCredentials = () => read<Record<string, CredentialRecord>>(KEYS.credentials, {});
export const getCredential = (identity: string) => getCredentials()[identity.toLowerCase()] ?? null;
export function saveCredential(c: CredentialRecord) {
  setRaw(KEYS.credentials, JSON.stringify({ ...getCredentials(), [c.identity.toLowerCase()]: c }));
}

/* session */
export const getSession = () => read<SessionRecord | null>(KEYS.session, null);
export const setSession = (s: SessionRecord) => setRaw(KEYS.session, JSON.stringify(s));
export const clearSession = () => setRaw(KEYS.session, null);

/* history */
export const getHistory = () => read<HistoryEntry[]>(KEYS.history, []);
export function pushHistory(entry: Omit<HistoryEntry, "id" | "ts">) {
  const next = [{ ...entry, id: generateId("h", 4), ts: Date.now() }, ...getHistory()].slice(0, 50);
  setRaw(KEYS.history, JSON.stringify(next));
}

/* events */
export const getEvents = () => read<SimEvent[]>(KEYS.events, []);
export function pushEvent(e: SimEvent) {
  setRaw(KEYS.events, JSON.stringify([...getEvents(), e].slice(-120)));
}

/* scenario shared by the authenticate and risk pages */
export const getScenario = (): RiskLevel => read<RiskLevel>(KEYS.scenario, "low");
export const setScenario = (l: RiskLevel) => setRaw(KEYS.scenario, JSON.stringify(l));

export function resetAll() {
  (Object.values(KEYS) as Key[]).forEach((k) => {
    try {
      sessionStorage.removeItem(k);
    } catch {
      /* ignore */
    }
    delete memory[k];
  });
  notify();
}
