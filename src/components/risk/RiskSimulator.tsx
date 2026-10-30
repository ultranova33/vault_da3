"use client";

import Link from "next/link";
import { useAnimatedNumber } from "@/hooks/useAnimatedNumber";
import { useRiskSimulation, type RiskResponse } from "@/hooks/useRiskSimulation";
import { SCENARIO_META } from "@/lib/simulation/risk-engine";
import StepUpPrompt from "@/components/authentication/StepUpPrompt";
import Terminal from "@/components/terminal/Terminal";
import Panel from "@/components/visual/Panel";
import RiskGauge from "./RiskGauge";
import RiskSpectrum from "./RiskSpectrum";
import ScenarioSwitch from "./ScenarioSwitch";
import SignalList from "./SignalList";

const OUTCOME: Record<RiskResponse, { text: string; tone: string } | null> = {
  idle: null,
  running: { text: "EVALUATING ATTEMPT…", tone: "info" },
  allowed: { text: "ALLOWED · normal verification flow completed (sandbox, no session issued)", tone: "ok" },
  stepup: { text: "STEP-UP REQUIRED · enter the code to continue", tone: "warn" },
  verified: { text: "ALLOWED AFTER STEP-UP · additional verification passed (sandbox)", tone: "ok" },
  blocked: { text: "BLOCKED · security event generated and added to the vault event log", tone: "bad" },
  failed: { text: "DENIED · step-up not completed", tone: "bad" },
};

export default function RiskSimulator() {
  const sim = useRiskSimulation();
  const { assessment: a, level } = sim;
  const score = useAnimatedNumber(a.score);
  const meta = SCENARIO_META[level];
  const outcome = OUTCOME[sim.response];
  const busy = sim.response === "running" || sim.response === "stepup";

  return (
    <div className={`risk lvl-${level}`}>
      <header className="page-head">
        <p className="tag">02 // RISK ENGINE · RULE-BASED DEMONSTRATION</p>
        <h1 className="page-title">
          <span>THREAT</span> <span className="outline lvl-word">{a.threat}</span>
        </h1>
      </header>

      <ScenarioSwitch value={level} onChange={sim.select} disabled={sim.response === "running"} />

      <div className="risk-grid">
        <Panel index="02.1" title={`${meta.title} · SCORE ${meta.range}`} tone={level} className="risk-core">
          <div className="risk-top">
            <RiskGauge score={score} level={level} />
            <div className="risk-verdict">
              <p className="tag">POLICY DECISION</p>
              <p className="verdict lvl-word" aria-live="polite">{a.decision.replace("_", "-")}</p>
              <h2 className="headline">{a.headline}</h2>
              <p className="hint">{a.recommendation}</p>
            </div>
          </div>
          <RiskSpectrum score={score} level={level} />
        </Panel>

        <Panel index="02.2" title="RISK FACTORS" tone={level}>
          <SignalList signals={a.signals} />
        </Panel>

        <Panel index="02.3" title="SECURITY RESPONSE" tone={level}>
          <p className="hint">
            Trigger an authentication attempt under this context to see the policy applied. This is a sandbox:
            no vault session is created here.
          </p>
          <div className="row">
            <button type="button" className="btn btn--primary" onClick={sim.trigger} disabled={busy}>
              {sim.response === "running" ? "RUNNING…" : "TRIGGER AUTH ATTEMPT →"}
            </button>
            <button type="button" className="btn btn--ghost" onClick={sim.replay} disabled={sim.response === "running"}>
              REPLAY EVALUATION
            </button>
          </div>
          {sim.stepUp && (
            <StepUpPrompt
              code={sim.stepUp.code}
              error={sim.stepUp.error}
              attempts={sim.stepUp.attempts}
              onSubmit={sim.submitStepUp}
              onCancel={sim.cancelStepUp}
            />
          )}
          {outcome && (
            <p className={`outcome outcome--${outcome.tone}`} role="status">
              {outcome.text}
            </p>
          )}
          <p className="hint">
            Want the full journey with this context? <Link href="/authenticate">Authenticate →</Link>
          </p>
        </Panel>

        <div className="risk-term">
          <Terminal title="RISK EVENT STREAM // SIMULATED" events={sim.events} />
        </div>
      </div>
    </div>
  );
}
