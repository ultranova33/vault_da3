"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import {
  DEMO_IDENTITY,
  LOGIN_STAGES,
  REGISTER_STAGES,
  useAuthSimulation,
} from "@/hooks/useAuthSimulation";
import { useSession } from "@/hooks/useStored";
import { formatDateTime, shorten } from "@/lib/simulation/format";
import { assessRisk } from "@/lib/simulation/risk-engine";
import Terminal from "@/components/terminal/Terminal";
import ScenarioSwitch from "@/components/risk/ScenarioSwitch";
import Panel from "@/components/visual/Panel";
import BiometricPrompt from "./BiometricPrompt";
import StageTracker from "./StageTracker";
import StepUpPrompt from "./StepUpPrompt";
import SuccessOverlay from "./SuccessOverlay";

const RAIL = ["A", "B", "C", "D"] as const;
const RAIL_LABEL = ["IDENTIFY", "REGISTER", "HANDSHAKE", "ACCESS"];

export default function AuthExperience() {
  const intent = useSearchParams().get("intent");
  const sim = useAuthSimulation();
  const session = useSession();
  const { phase, flow, setIdentity } = sim;

  useEffect(() => {
    if (intent === "demo") setIdentity((cur) => cur || DEMO_IDENTITY);
  }, [intent, setIdentity]);

  const railIndex =
    phase === "identify" ? 0
    : phase === "registering" || phase === "registered" ? 1
    : phase === "authenticating" || phase === "stepup" ? 2
    : phase === "granted" ? 3
    : flow === "register" ? 1 : 2;

  const stages = flow === "register" ? REGISTER_STAGES : LOGIN_STAGES;
  const running = phase === "registering" || phase === "authenticating" || phase === "stepup";
  const risk = assessRisk(sim.scenario);

  return (
    <div className="auth">
      <header className="page-head">
        <p className="tag">01 // AUTHENTICATION EXPERIENCE · SIMULATED</p>
        <h1 className="page-title">
          <span>PROVE</span> <span className="outline">YOU</span> <span className="frag">EXIST</span>
        </h1>
      </header>

      <div className="auth-grid">
        <ol className="rail" aria-label="Journey">
          {RAIL.map((l, i) => (
            <li key={l} className={i === railIndex ? "is-on" : i < railIndex ? "is-done" : ""} aria-current={i === railIndex ? "step" : undefined}>
              <b>{l}</b>
              <span>{RAIL_LABEL[i]}</span>
            </li>
          ))}
        </ol>

        <div className="auth-main">
          {phase === "identify" && (
            <Panel index="A" title="IDENTIFICATION">
              <form
                className="idform"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (sim.credential) sim.authenticate();
                  else sim.register();
                }}
                noValidate
              >
                <label htmlFor="identity">USERNAME OR EMAIL</label>
                <input
                  id="identity"
                  name="identity"
                  type="text"
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                  placeholder="name@bank.example"
                  value={sim.identity}
                  onChange={(e) => sim.setIdentity(e.target.value)}
                  aria-invalid={!!sim.error}
                  aria-describedby="identity-help"
                  disabled={sim.busy}
                />
                <p id="identity-help" className={sim.error ? "field-error" : "hint"} role={sim.error ? "alert" : undefined}>
                  {sim.error ??
                    (sim.credential
                      ? `PASSKEY ON FILE · created ${formatDateTime(sim.credential.createdAt)} · ${shorten(sim.credential.credentialId, 6, 4)}`
                      : "No password field exists. Any name works; nothing leaves this browser tab.")}
                </p>

                <div className="modes">
                  <button
                    type="button"
                    className={`mode ${intent === "register" ? "is-hint" : ""}`}
                    onClick={sim.register}
                    disabled={sim.busy}
                  >
                    <small>A1</small>
                    <strong>REGISTER PASSKEY</strong>
                    <span>Create a simulated device-bound credential.</span>
                  </button>
                  <button
                    type="button"
                    className={`mode ${intent === "login" ? "is-hint" : ""}`}
                    onClick={sim.authenticate}
                    disabled={sim.busy || !sim.credential}
                  >
                    <small>A2</small>
                    <strong>AUTHENTICATE</strong>
                    <span>
                      {sim.credential ? "Run the challenge-response handshake." : "Needs a passkey registered in this tab first."}
                    </span>
                  </button>
                  <button
                    type="button"
                    className={`mode mode--demo ${intent === "demo" ? "is-hint" : ""}`}
                    onClick={sim.runDemo}
                    disabled={sim.busy}
                  >
                    <small>A3</small>
                    <strong>DEMO MODE</strong>
                    <span>Register and authenticate automatically in one run.</span>
                  </button>
                </div>

                <div className="ctx">
                  <p className="tag">SIMULATED CONTEXT · DECIDES THE RISK OUTCOME</p>
                  <ScenarioSwitch value={sim.scenario} onChange={sim.setScenario} compact disabled={sim.busy} />
                  <p className="hint">
                    {risk.headline} · score {risk.score}/100. <Link href="/risk">Inspect signals in the Risk Engine →</Link>
                  </p>
                </div>
              </form>
            </Panel>
          )}

          {running && (
            <Panel index={flow === "register" ? "B" : "C"} title={flow === "register" ? "PASSKEY REGISTRATION" : "AUTHENTICATION HANDSHAKE"}>
              <StageTracker stages={stages} current={sim.stage} />
              {sim.demoActive && <p className="tag">DEMO MODE · AUTO-CONFIRMING</p>}
              {sim.challenge && (
                <div className="kv">
                  <span>{flow === "register" ? "REG CHALLENGE" : "FRESH CHALLENGE"}</span>
                  <code>{sim.challenge}</code>
                </div>
              )}
              {phase === "stepup" && sim.stepUp && !sim.demoActive && (
                <StepUpPrompt
                  code={sim.stepUp.code}
                  error={sim.stepUp.error}
                  attempts={sim.stepUp.attempts}
                  onSubmit={sim.submitStepUp}
                  onCancel={sim.cancelStepUp}
                />
              )}
              {phase === "stepup" && sim.demoActive && <p className="hint">Elevated risk: step-up code is being entered automatically.</p>}
              {phase !== "stepup" && !sim.prompt && <p className="busy" aria-live="polite">PROCESSING<span aria-hidden="true">…</span></p>}
            </Panel>
          )}

          {phase === "registered" && (
            <Panel index="B" title="PASSKEY REGISTERED" tone="low">
              <p className="big-ok">REGISTERED</p>
              <p className="hint">
                A simulated credential for <b>{sim.identity}</b> is stored in this tab&apos;s sessionStorage. No real key pair exists.
              </p>
              <div className="row">
                <button type="button" className="btn btn--primary" onClick={sim.authenticate} disabled={sim.busy}>
                  AUTHENTICATE NOW →
                </button>
                <button type="button" className="btn btn--ghost" onClick={sim.reset}>
                  BACK
                </button>
              </div>
            </Panel>
          )}

          {phase === "denied" && sim.denied && (
            <Panel
              index={flow === "register" ? "B" : "C"}
              title={sim.denied.title}
              tone={sim.denied.kind === "blocked" ? "high" : sim.denied.kind === "cancelled" ? "medium" : "high"}
            >
              <p className="big-bad">{sim.denied.kind === "blocked" ? "BLOCKED" : sim.denied.kind === "cancelled" ? "CANCELLED" : "DENIED"}</p>
              <p className="hint">{sim.denied.detail}</p>
              <div className="row">
                <button type="button" className="btn btn--primary" onClick={sim.reset}>
                  TRY AGAIN
                </button>
                {sim.denied.kind === "blocked" && (
                  <button type="button" className="btn btn--ghost" onClick={() => { sim.setScenario("low"); sim.reset(); }}>
                    SWITCH TO LOW-RISK CONTEXT
                  </button>
                )}
                <Link href="/risk" className="btn btn--ghost">
                  RISK ENGINE
                </Link>
              </div>
            </Panel>
          )}

          {phase === "granted" && <SuccessOverlay riskScore={session?.riskScore ?? null} />}
        </div>

        <aside className="auth-side">
          <Terminal title="HANDSHAKE LOG // SIMULATED" events={sim.events} onClear={sim.clearTerminal} empty="no events yet. start a registration or authentication." />
        </aside>
      </div>

      {sim.prompt && <BiometricPrompt kind={sim.prompt} onRespond={sim.respondPrompt} />}
    </div>
  );
}
