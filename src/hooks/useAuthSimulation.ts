"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { EventLevel, SimEvent } from "@/types/auth";
import {
  buildCredential,
  collectDeviceMeta,
  createAssertion,
  createRegistrationOptions,
  IDENTITY_PATTERN,
  verifyAssertion,
} from "@/lib/simulation/passkey";
import { generateChallenge, generateOtp } from "@/lib/simulation/challenge";
import { assessRisk } from "@/lib/simulation/risk-engine";
import { createSession } from "@/lib/simulation/session";
import { AbortedError, makeEvent, sleep } from "@/lib/simulation/event-engine";
import { shorten } from "@/lib/simulation/format";
import {
  getCredential,
  pushEvent,
  pushHistory,
  saveCredential,
  setScenario,
  setSession,
} from "@/lib/simulation/store";
import { useCredentials, useScenario } from "./useStored";

export type Phase =
  | "identify"
  | "registering"
  | "registered"
  | "authenticating"
  | "stepup"
  | "granted"
  | "denied";

export type Flow = "register" | "login";
export type PromptKind = "register" | "login";
export type PromptResult = "confirm" | "cancel" | "mismatch";

export interface Denied {
  kind: "failed" | "blocked" | "cancelled" | "stepup";
  title: string;
  detail: string;
}

export const REGISTER_STAGES = ["INITIATE", "CHALLENGE", "DEVICE", "USER VERIFY", "CREDENTIAL"];
export const LOGIN_STAGES = ["CHALLENGE", "DEVICE REQ", "USER VERIFY", "ASSERTION", "RISK EVAL", "SESSION"];

export const DEMO_IDENTITY = "demo.user@vault.demo";
const MAX_STEPUP_ATTEMPTS = 3;

export function validateIdentity(raw: string): string | null {
  const v = raw.trim();
  if (!v) return "Enter a username or email to continue.";
  if (!IDENTITY_PATTERN.test(v)) return "Use 3–64 characters: letters, numbers, . _ % + - (optionally name@domain.tld).";
  return null;
}

export function useAuthSimulation() {
  const scenario = useScenario();
  const credentials = useCredentials();

  const [identity, setIdentity] = useState("");
  const [phase, setPhase] = useState<Phase>("identify");
  const [flow, setFlow] = useState<Flow>("register");
  const [stage, setStage] = useState(-1);
  const [busy, setBusy] = useState(false);
  const [events, setEvents] = useState<SimEvent[]>([]);
  const [challenge, setChallenge] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<PromptKind | null>(null);
  const [stepUp, setStepUp] = useState<{ code: string; attempts: number; error: string | null } | null>(null);
  const [denied, setDenied] = useState<Denied | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [demoActive, setDemoActive] = useState(false);

  const alive = useRef(true);
  const busyRef = useRef(false);
  const promptResolver = useRef<((r: PromptResult) => void) | null>(null);
  const stepResolver = useRef<((r: "ok" | "cancel" | "fail") => void) | null>(null);
  const stepCode = useRef<string>("");
  const stepAttempts = useRef(0);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      promptResolver.current?.("cancel");
      stepResolver.current?.("cancel");
    };
  }, []);

  const emit = useCallback((level: EventLevel, tag: string, msg: string) => {
    const ev = makeEvent(level, tag, msg);
    pushEvent(ev);
    if (alive.current) setEvents((p) => [...p, ev].slice(-200));
  }, []);

  const wait = useCallback(async (ms: number) => {
    await sleep(ms);
    if (!alive.current) throw new AbortedError();
  }, []);

  const askBiometric = useCallback(
    (kind: PromptKind, auto: boolean) =>
      new Promise<PromptResult>((resolve) => {
        if (auto) {
          emit("info", "UV", "demo mode: biometric confirmation auto-granted");
          setTimeout(() => resolve("confirm"), 700);
          return;
        }
        promptResolver.current = resolve;
        setPrompt(kind);
      }),
    [emit],
  );

  const respondPrompt = useCallback((r: PromptResult) => {
    const resolve = promptResolver.current;
    promptResolver.current = null;
    setPrompt(null);
    resolve?.(r);
  }, []);

  const askStepUp = useCallback(
    (auto: boolean) =>
      new Promise<"ok" | "cancel" | "fail">((resolve) => {
        const code = generateOtp();
        stepCode.current = code;
        stepAttempts.current = 0;
        setStepUp({ code, attempts: 0, error: null });
        setPhase("stepup");
        if (auto) {
          emit("info", "STEP-UP", "demo mode: step-up code auto-entered");
          setTimeout(() => resolve("ok"), 1400);
          return;
        }
        stepResolver.current = resolve;
      }),
    [emit],
  );

  const submitStepUp = useCallback((value: string) => {
    const resolve = stepResolver.current;
    if (!resolve) return;
    if (value.trim() === stepCode.current) {
      stepResolver.current = null;
      resolve("ok");
      return;
    }
    stepAttempts.current += 1;
    const attempts = stepAttempts.current;
    setStepUp((s) => (s ? { ...s, attempts, error: `Code mismatch (${attempts}/${MAX_STEPUP_ATTEMPTS}).` } : s));
    if (attempts >= MAX_STEPUP_ATTEMPTS) {
      stepResolver.current = null;
      resolve("fail");
    }
  }, []);

  const cancelStepUp = useCallback(() => {
    const resolve = stepResolver.current;
    stepResolver.current = null;
    resolve?.("cancel");
  }, []);

  const deny = useCallback((d: Denied) => {
    if (!alive.current) return;
    setStepUp(null);
    setPrompt(null);
    setDenied(d);
    setPhase("denied");
  }, []);

  /* ---------- REGISTRATION CEREMONY ---------- */
  const runRegister = useCallback(
    async (id: string, auto: boolean): Promise<boolean> => {
      setFlow("register");
      setPhase("registering");
      setDenied(null);
      setStage(0);
      emit("sys", "REG", `registration ceremony started for ${id} [SIMULATED]`);
      await wait(450);

      setStage(1);
      const options = createRegistrationOptions(id);
      setChallenge(options.challenge);
      emit("info", "CHALLENGE", `32-byte challenge via crypto.getRandomValues: ${shorten(options.challenge, 12, 6)}`);
      await wait(550);
      emit("info", "RP", `relying party id "${options.rp.id}", alg ES256/RS256, UV required`);
      await wait(450);

      setStage(2);
      const device = collectDeviceMeta();
      emit("info", "DEVICE", `platform authenticator detected: ${device.platform} (simulated)`);
      await wait(550);

      setStage(3);
      emit("warn", "UV", "awaiting user verification (simulated biometric)…");
      const result = await askBiometric("register", auto);
      if (result === "cancel") {
        emit("warn", "UV", "registration cancelled by user, nothing stored");
        pushHistory({ identity: id, type: "REGISTER", outcome: "CANCELLED", method: "Passkey (simulated)", riskScore: null, riskLevel: null });
        deny({ kind: "cancelled", title: "REGISTRATION CANCELLED", detail: "You cancelled the biometric prompt. No credential was created." });
        return false;
      }
      if (result === "mismatch") {
        emit("error", "UV", "simulated biometric mismatch, registration refused");
        pushHistory({ identity: id, type: "REGISTER", outcome: "FAILURE", method: "Passkey (simulated)", riskScore: null, riskLevel: null });
        deny({ kind: "failed", title: "VERIFICATION FAILED", detail: "Simulated biometric mismatch. No credential was created. Try again." });
        return false;
      }
      emit("ok", "UV", "user verification passed (simulated)");

      setStage(4);
      await wait(500);
      const credential = buildCredential(id, options, device);
      saveCredential(credential);
      pushHistory({ identity: id, type: "REGISTER", outcome: "SUCCESS", method: "Passkey (simulated)", riskScore: null, riskLevel: null });
      emit("ok", "CREDENTIAL", `credential id ${shorten(credential.credentialId, 8, 6)} stored in sessionStorage (demo metadata only)`);
      emit("ok", "REG", "registration complete [SIMULATED, no real key pair was generated]");
      if (alive.current) {
        setStage(5);
        setPhase("registered");
      }
      return true;
    },
    [askBiometric, deny, emit, wait],
  );

  /* ---------- AUTHENTICATION HANDSHAKE ---------- */
  const runAuthenticate = useCallback(
    async (id: string, auto: boolean): Promise<boolean> => {
      const credential = getCredential(id);
      if (!credential) {
        setError("No passkey found for this identity in this tab. Register one first.");
        setPhase("identify");
        return false;
      }
      setFlow("login");
      setPhase("authenticating");
      setDenied(null);
      setStage(0);
      emit("sys", "AUTH", `authentication handshake started for ${id} [SIMULATED]`);

      const fresh = generateChallenge();
      setChallenge(fresh);
      emit("info", "CHALLENGE", `fresh challenge ${shorten(fresh, 12, 6)} (single use)`);
      await wait(550);

      setStage(1);
      emit("info", "DEVICE", `request sent to authenticator, allowCredentials: ${shorten(credential.credentialId, 6, 4)}`);
      await wait(550);

      setStage(2);
      emit("warn", "UV", "awaiting user verification (simulated biometric)…");
      const result = await askBiometric("login", auto);
      if (result === "cancel") {
        emit("warn", "UV", "authentication cancelled by user");
        pushHistory({ identity: id, type: "AUTHENTICATE", outcome: "CANCELLED", method: "Passkey (simulated)", riskScore: null, riskLevel: null });
        deny({ kind: "cancelled", title: "AUTHENTICATION CANCELLED", detail: "The biometric prompt was cancelled. No session was issued." });
        return false;
      }
      if (result === "mismatch") {
        emit("error", "UV", "simulated biometric mismatch, assertion not produced");
        pushHistory({ identity: id, type: "AUTHENTICATE", outcome: "FAILURE", method: "Passkey (simulated)", riskScore: null, riskLevel: null });
        deny({ kind: "failed", title: "AUTHENTICATION FAILED", detail: "Simulated biometric mismatch. No assertion was produced, no session issued." });
        return false;
      }
      emit("ok", "UV", "user verification passed (simulated)");

      setStage(3);
      await wait(500);
      const assertion = createAssertion(credential, fresh);
      emit("info", "ASSERTION", `authenticator returned counter=${assertion.signCount}, sig=${shorten(assertion.signature, 8, 4)} (random bytes, not a real signature)`);
      await wait(550);
      const valid = verifyAssertion(credential, fresh, assertion);
      if (!valid) {
        emit("error", "VERIFY", "assertion structure check failed");
        pushHistory({ identity: id, type: "AUTHENTICATE", outcome: "FAILURE", method: "Passkey (simulated)", riskScore: null, riskLevel: null });
        deny({ kind: "failed", title: "ASSERTION REJECTED", detail: "The simulated assertion did not match the stored credential or challenge." });
        return false;
      }
      emit("ok", "VERIFY", "challenge echo, credential id and counter match [structural check only, no signature verification]");

      setStage(4);
      await wait(450);
      const risk = assessRisk(scenario);
      emit("sys", "RISK", `context ${scenario.toUpperCase()}: score ${risk.score}/100, threat ${risk.threat}`);
      risk.signals
        .filter((s) => s.status !== "clear")
        .forEach((s) => emit(s.status === "alert" ? "error" : "warn", "SIGNAL", `${s.label.toLowerCase()} :: ${s.value}`));
      await wait(600);

      if (risk.decision === "BLOCK") {
        emit("error", "SECURITY", "BLOCKED: risk policy denies access, no session issued");
        emit("error", "SECURITY", "security event raised for institution review (simulated)");
        pushHistory({ identity: id, type: "AUTHENTICATE", outcome: "BLOCKED", method: "Passkey (simulated)", riskScore: risk.score, riskLevel: risk.level });
        deny({
          kind: "blocked",
          title: "ACCESS BLOCKED",
          detail: `Risk score ${risk.score}/100 (HIGH). The risk engine denied this attempt and logged a security event.`,
        });
        return false;
      }

      let stepUpUsed = false;
      if (risk.decision === "STEP_UP") {
        emit("warn", "POLICY", "elevated risk: step-up verification required before session issue");
        const outcome = await askStepUp(auto);
        if (outcome !== "ok") {
          const cancelled = outcome === "cancel";
          emit("error", "STEP-UP", cancelled ? "step-up cancelled, access withheld" : "step-up failed, access withheld");
          pushHistory({ identity: id, type: "AUTHENTICATE", outcome: cancelled ? "CANCELLED" : "FAILURE", method: "Passkey + step-up (simulated)", riskScore: risk.score, riskLevel: risk.level });
          deny({
            kind: "stepup",
            title: cancelled ? "STEP-UP CANCELLED" : "STEP-UP FAILED",
            detail: "Medium-risk access is only granted after additional verification. No session was issued.",
          });
          return false;
        }
        stepUpUsed = true;
        setStepUp(null);
        setPhase("authenticating");
        emit("ok", "STEP-UP", "additional verification passed (simulated)");
      } else {
        emit("ok", "POLICY", "low risk: no additional verification needed");
      }

      setStage(5);
      await wait(500);
      const session = createSession(credential, risk, stepUpUsed);
      saveCredential({ ...credential, signCount: assertion.signCount, lastUsedAt: Date.now() });
      setSession(session);
      pushHistory({
        identity: id,
        type: "AUTHENTICATE",
        outcome: "SUCCESS",
        method: session.method,
        riskScore: risk.score,
        riskLevel: risk.level,
      });
      emit("ok", "SESSION", `demo session ${session.sessionId} issued (client-side only)`);
      emit("ok", "AUTH", "authentication complete [SIMULATED]");
      if (alive.current) {
        setStage(6);
        setPhase("granted");
      }
      return true;
    },
    [askBiometric, askStepUp, deny, emit, scenario, wait],
  );

  const guarded = useCallback(
    async (fn: () => Promise<unknown>) => {
      if (busyRef.current) return;
      busyRef.current = true;
      setBusy(true);
      setError(null);
      try {
        await fn();
      } catch (e) {
        if (!(e instanceof AbortedError)) {
          const msg = e instanceof Error ? e.message : "Unexpected simulation error.";
          emit("error", "SYS", msg);
          if (alive.current) {
            setError(msg);
            setPhase("identify");
          }
        }
      } finally {
        busyRef.current = false;
        if (alive.current) {
          setBusy(false);
          setPrompt(null);
        }
      }
    },
    [emit],
  );
  const checked = useCallback((id: string): boolean => {
    const problem = validateIdentity(id);
    if (problem) {
      setError(problem);
      return false;
    }
    return true;
  }, []);

  const register = useCallback(() => {
    const id = identity.trim();
    if (!checked(id)) return;
    setDemoActive(false);
    void guarded(() => runRegister(id, false));
  }, [identity, checked, guarded, runRegister]);

  const authenticate = useCallback(() => {
    const id = identity.trim();
    if (!checked(id)) return;
    setDemoActive(false);
    void guarded(() => runAuthenticate(id, false));
  }, [identity, checked, guarded, runAuthenticate]);

  const runDemo = useCallback(() => {
    const id = identity.trim() || DEMO_IDENTITY;
    if (!checked(id)) return;
    setIdentity(id);
    setDemoActive(true);
    void guarded(async () => {
      if (await runRegister(id, true)) {
        await wait(700);
        await runAuthenticate(id, true);
      }
    });
  }, [identity, checked, guarded, runRegister, runAuthenticate, wait]);

  const reset = useCallback(() => {
    if (busyRef.current) return;
    setPhase("identify");
    setDenied(null);
    setError(null);
    setStage(-1);
    setStepUp(null);
    setChallenge(null);
    setDemoActive(false);
  }, []);

  const clearTerminal = useCallback(() => setEvents([]), []);

  const credential = identity.trim() ? (credentials[identity.trim().toLowerCase()] ?? null) : null;

  return {
    identity,
    setIdentity,
    phase,
    flow,
    stage,
    busy,
    events,
    challenge,
    prompt,
    respondPrompt,
    stepUp,
    submitStepUp,
    cancelStepUp,
    denied,
    error,
    demoActive,
    credential,
    scenario,
    setScenario,
    register,
    authenticate,
    runDemo,
    reset,
    clearTerminal,
  };
}
