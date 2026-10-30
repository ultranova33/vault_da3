"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SimEvent } from "@/types/auth";
import type { RiskLevel } from "@/types/risk";
import {
  assessRisk,
  evaluationScript,
  responseScript,
  type ScriptedEvent,
} from "@/lib/simulation/risk-engine";
import { generateOtp } from "@/lib/simulation/challenge";
import { makeEvent } from "@/lib/simulation/event-engine";
import { pushEvent, setScenario } from "@/lib/simulation/store";
import { useScenario } from "./useStored";

export type RiskResponse = "idle" | "running" | "allowed" | "stepup" | "verified" | "blocked" | "failed";

const MAX_ATTEMPTS = 3;

export function useRiskSimulation() {
  const level = useScenario();
  const assessment = useMemo(() => assessRisk(level), [level]);

  const [events, setEvents] = useState<SimEvent[]>([]);
  const [response, setResponse] = useState<RiskResponse>("idle");
  const [stepUp, setStepUp] = useState<{ code: string; attempts: number; error: string | null } | null>(null);

  const timers = useRef<number[]>([]);
  const code = useRef("");
  const attempts = useRef(0);

  const clearTimers = useCallback(() => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  }, []);

  const append = useCallback((line: ScriptedEvent) => {
    setEvents((p) => [...p, makeEvent(line.level, line.tag, line.msg)].slice(-120));
  }, []);

  const play = useCallback(
    (lines: ScriptedEvent[], gap: number, done?: () => void) => {
      lines.forEach((line, i) => {
        timers.current.push(window.setTimeout(() => append(line), i * gap));
      });
      if (done) timers.current.push(window.setTimeout(done, lines.length * gap + 120));
    },
    [append],
  );

  const start = useCallback(
    (next: RiskLevel) => {
      clearTimers();
      setEvents([]);
      setResponse("idle");
      setStepUp(null);
      play(evaluationScript(next), 240);
    },
    [clearTimers, play],
  );

  useEffect(() => {
    // initial stream on mount; later scenario changes go through select()
    play(evaluationScript(level), 240);
    return clearTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const select = useCallback(
    (next: RiskLevel) => {
      if (next === level && response === "idle") return;
      setScenario(next);
      start(next);
    },
    [level, response, start],
  );

  const trigger = useCallback(() => {
    if (response === "running" || response === "stepup") return;
    clearTimers();
    setResponse("running");
    setStepUp(null);
    play(responseScript(level), 520, () => {
      if (level === "low") {
        setResponse("allowed");
      } else if (level === "medium") {
        code.current = generateOtp();
        attempts.current = 0;
        setStepUp({ code: code.current, attempts: 0, error: null });
        setResponse("stepup");
      } else {
        const ev = makeEvent("error", "SECURITY", "risk simulator: high-risk attempt blocked, security event logged");
        pushEvent(ev);
        setResponse("blocked");
      }
    });
  }, [clearTimers, level, play, response]);

  const submitStepUp = useCallback(
    (value: string) => {
      if (response !== "stepup") return;
      if (value.trim() === code.current) {
        append({ level: "ok", tag: "STEP-UP", msg: "additional verification passed, access would be granted (sandbox)" });
        setStepUp(null);
        setResponse("verified");
        return;
      }
      attempts.current += 1;
      const n = attempts.current;
      append({ level: "warn", tag: "STEP-UP", msg: `code mismatch (${n}/${MAX_ATTEMPTS})` });
      if (n >= MAX_ATTEMPTS) {
        append({ level: "error", tag: "SECURITY", msg: "step-up failed, access denied (sandbox)" });
        setStepUp(null);
        setResponse("failed");
      } else {
        setStepUp((s) => (s ? { ...s, attempts: n, error: `Code mismatch (${n}/${MAX_ATTEMPTS}).` } : s));
      }
    },
    [append, response],
  );

  const cancelStepUp = useCallback(() => {
    append({ level: "error", tag: "STEP-UP", msg: "step-up cancelled, access denied (sandbox)" });
    setStepUp(null);
    setResponse("failed");
  }, [append]);

  const replay = useCallback(() => start(level), [level, start]);

  return { level, assessment, events, response, stepUp, select, trigger, submitStepUp, cancelStepUp, replay };
}
