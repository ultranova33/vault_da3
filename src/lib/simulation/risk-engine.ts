import type {
  Decision,
  RiskAssessment,
  RiskLevel,
  RiskScenarioMeta,
  RiskSignal,
} from "@/types/risk";
import type { EventLevel } from "@/types/auth";

/**
 * Deterministic, rule-based demonstration risk engine. Each scenario is a fixed
 * set of signals; the score is the sum of their weights. A production engine
 * would consume real device, network and behavioural telemetry.
 */

export const SCENARIO_META: Record<RiskLevel, RiskScenarioMeta> = {
  low: {
    level: "low",
    code: "L",
    title: "TRUSTED ENVIRONMENT",
    subtitle: "Known device, known credential, ordinary behaviour.",
    range: "0–30",
  },
  medium: {
    level: "medium",
    code: "M",
    title: "ELEVATED SCRUTINY",
    subtitle: "New device and minor anomalies. Step-up required.",
    range: "31–65",
  },
  high: {
    level: "high",
    code: "H",
    title: "SUSPICIOUS ENVIRONMENT",
    subtitle: "Unknown credential, hostile origin, repeated failures.",
    range: "66–100",
  },
};

export const LEVELS: RiskLevel[] = ["low", "medium", "high"];

const SIGNALS: Record<RiskLevel, RiskSignal[]> = {
  low: [
    { id: "device", label: "DEVICE", value: "Recognised, enrolled 14 days ago", status: "clear", weight: 2 },
    { id: "credential", label: "CREDENTIAL", value: "Known passkey, counter in sequence", status: "clear", weight: 3 },
    { id: "pattern", label: "ACCESS PATTERN", value: "Matches 30-day baseline", status: "clear", weight: 4 },
    { id: "origin", label: "ORIGIN", value: "Home network, clean reputation", status: "clear", weight: 3 },
    { id: "failures", label: "FAILED ATTEMPTS", value: "0 in last 24h", status: "clear", weight: 2 },
  ],
  medium: [
    { id: "device", label: "DEVICE", value: "Never seen before", status: "watch", weight: 14 },
    { id: "time", label: "ACCESS TIME", value: "03:12 local, outside usual hours", status: "watch", weight: 12 },
    { id: "geo", label: "GEO-DRIFT", value: "New city, 480 km from last login", status: "watch", weight: 8 },
    { id: "credential", label: "CREDENTIAL", value: "Known passkey, counter in sequence", status: "clear", weight: 3 },
    { id: "origin", label: "ORIGIN", value: "Mobile carrier, unverified reputation", status: "watch", weight: 9 },
    { id: "failures", label: "FAILED ATTEMPTS", value: "0 in last 24h", status: "clear", weight: 2 },
  ],
  high: [
    { id: "credential", label: "CREDENTIAL", value: "UNKNOWN to relying party", status: "alert", weight: 28 },
    { id: "origin", label: "ORIGIN", value: "Anonymising proxy, RP-ID mismatch", status: "alert", weight: 24 },
    { id: "failures", label: "FAILED ATTEMPTS", value: "5 in last 10 minutes", status: "alert", weight: 18 },
    { id: "context", label: "CONTEXT", value: "Automation fingerprint, no human input", status: "alert", weight: 14 },
    { id: "device", label: "DEVICE", value: "Never seen before", status: "watch", weight: 3 },
  ],
};

const COPY: Record<
  RiskLevel,
  { decision: Decision; threat: string; headline: string; recommendation: string }
> = {
  low: {
    decision: "ALLOW",
    threat: "NOMINAL",
    headline: "AUTHENTICATION PERMITTED",
    recommendation: "Normal passkey verification flow. No additional friction applied.",
  },
  medium: {
    decision: "STEP_UP",
    threat: "ELEVATED",
    headline: "STEP-UP VERIFICATION REQUIRED",
    recommendation:
      "Passkey alone is not enough. Access is granted only after additional verification succeeds.",
  },
  high: {
    decision: "BLOCK",
    threat: "CRITICAL",
    headline: "AUTHENTICATION BLOCKED",
    recommendation:
      "Attempt denied, security event raised, credential flagged for review by the institution.",
  },
};

export function classifyScore(score: number): RiskLevel {
  if (score <= 30) return "low";
  if (score <= 65) return "medium";
  return "high";
}

export function assessRisk(level: RiskLevel): RiskAssessment {
  const signals = SIGNALS[level];
  const score = Math.min(
    100,
    signals.reduce((sum, s) => sum + s.weight, 0),
  );
  return { level: classifyScore(score), score, signals, ...COPY[level] };
}

export interface ScriptedEvent {
  level: EventLevel;
  tag: string;
  msg: string;
}

/** Evaluation lines streamed to a terminal when a scenario is selected. */
export function evaluationScript(level: RiskLevel): ScriptedEvent[] {
  const a = assessRisk(level);
  const lines: ScriptedEvent[] = [
    { level: "sys", tag: "RISK", msg: `scenario loaded: ${SCENARIO_META[level].title}` },
    ...a.signals.map<ScriptedEvent>((s) => ({
      level: s.status === "alert" ? "error" : s.status === "watch" ? "warn" : "info",
      tag: "SIGNAL",
      msg: `${s.label.toLowerCase()} :: ${s.value} (+${s.weight})`,
    })),
    {
      level: level === "low" ? "ok" : level === "medium" ? "warn" : "error",
      tag: "SCORE",
      msg: `aggregate risk ${a.score}/100 → ${level.toUpperCase()} (${a.threat})`,
    },
    {
      level: level === "low" ? "ok" : level === "medium" ? "warn" : "error",
      tag: "POLICY",
      msg: `decision ${a.decision}: ${a.headline.toLowerCase()}`,
    },
  ];
  return lines;
}

/** Lines streamed when the judge triggers the scenario's security response. */
export function responseScript(level: RiskLevel): ScriptedEvent[] {
  switch (level) {
    case "low":
      return [
        { level: "info", tag: "AUTH", msg: "fresh challenge issued, passkey assertion accepted (simulated)" },
        { level: "ok", tag: "POLICY", msg: "no step-up needed, sandbox session would be issued" },
      ];
    case "medium":
      return [
        { level: "info", tag: "AUTH", msg: "passkey assertion accepted (simulated)" },
        { level: "warn", tag: "POLICY", msg: "risk above 30, step-up verification demanded" },
        { level: "warn", tag: "STEP-UP", msg: "demo one-time code issued, awaiting user input" },
      ];
    case "high":
      return [
        { level: "error", tag: "AUTH", msg: "assertion rejected, credential unknown to relying party" },
        { level: "error", tag: "SECURITY", msg: "BLOCKED: high-risk attempt denied, no session issued" },
        { level: "error", tag: "SECURITY", msg: "security event raised for institution review (simulated)" },
      ];
  }
}
