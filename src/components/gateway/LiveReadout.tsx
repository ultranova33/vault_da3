"use client";

import { useEffect, useState } from "react";
import type { EventLevel, SimEvent } from "@/types/auth";
import { generateChallenge, toHex, randomBytes } from "@/lib/simulation/challenge";
import { makeEvent } from "@/lib/simulation/event-engine";
import Terminal from "@/components/terminal/Terminal";

type Line = [EventLevel, string, () => string];

const LINES: Line[] = [
  ["sys", "BOOT", () => "auth core online"],
  ["info", "CHALLENGE", () => `issued 32B nonce ${generateChallenge().slice(0, 22)}…`],
  ["info", "DEVICE", () => "platform authenticator present (simulated)"],
  ["ok", "VERIFY", () => `assertion counter++ sig=${toHex(randomBytes(6))}… [SIM]`],
  ["info", "RISK", () => "context LOW · score 14/100 · ALLOW"],
  ["warn", "RISK", () => "context MEDIUM · score 48/100 · STEP-UP"],
  ["error", "SECURITY", () => "context HIGH · score 87/100 · BLOCK"],
  ["sys", "ORIGIN", () => "rp-id bound: lookalike domains get no assertion"],
];

/** Looping decorative telemetry. Clearly labelled as simulated. */
export default function LiveReadout() {
  const [events, setEvents] = useState<SimEvent[]>([]);

  useEffect(() => {
    let i = 0;
    const push = () => {
      const [level, tag, msg] = LINES[i % LINES.length];
      i += 1;
      setEvents((p) => [...p, makeEvent(level, tag, msg())].slice(-12));
    };
    push();
    const t = window.setInterval(push, 1300);
    return () => window.clearInterval(t);
  }, []);

  return <Terminal title="LIVE READOUT" events={events} className="term--short" />;
}
