"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useCredentials, useEventLog, useHistory, useHydrated, useSession } from "@/hooks/useStored";
import { formatDateTime, formatDuration, redact } from "@/lib/simulation/format";
import { makeEvent } from "@/lib/simulation/event-engine";
import { clearSession, pushEvent } from "@/lib/simulation/store";
import type { SimEvent } from "@/types/auth";
import Terminal from "@/components/terminal/Terminal";
import RiskSpectrum from "@/components/risk/RiskSpectrum";
import Panel from "@/components/visual/Panel";

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="kv">
      <span>{k}</span>
      <code>{v}</code>
    </div>
  );
}

export default function VaultView() {
  const router = useRouter();
  const hydrated = useHydrated();
  const session = useSession();
  const credentials = useCredentials();
  const history = useHistory();
  const stored = useEventLog();
  const [beats, setBeats] = useState<SimEvent[]>([]);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!session) return;
    const tick = window.setInterval(() => setNow(Date.now()), 1000);
    const beat = window.setInterval(
      () => setBeats((b) => [...b, makeEvent("sys", "HEARTBEAT", "session alive [simulated, client-side timer]")].slice(-20)),
      8000,
    );
    return () => {
      window.clearInterval(tick);
      window.clearInterval(beat);
    };
  }, [session]);

  const feed = useMemo(() => [...stored, ...beats].sort((a, b) => a.ts - b.ts).slice(-80), [stored, beats]);
  const security = useMemo(
    () => stored.filter((e) => e.tag === "SECURITY" || e.level === "error").slice(-8).reverse(),
    [stored],
  );

  if (!hydrated) return <p className="loading">DECRYPTING SEGMENT…</p>;

  if (!session) {
    return (
      <div className="locked">
        <p className="tag">03 // VAULT · ACCESS DENIED</p>
        <h1 className="page-title">
          <span className="outline">LOCKED</span>
        </h1>
        <p className="locked-copy">
          No active demo session in this tab. The vault only opens after a successful simulated authentication.
          Nothing is protected server-side; this gate is part of the demonstration.
        </p>
        <div className="row">
          <Link href="/authenticate" className="btn btn--primary">AUTHENTICATE →</Link>
          <Link href="/authenticate?intent=demo" className="btn btn--ghost">RUN DEMO MODE</Link>
          <Link href="/risk" className="btn btn--ghost">RISK ENGINE</Link>
        </div>
      </div>
    );
  }

  const cred = credentials[session.identity.toLowerCase()];
  const logout = () => {
    pushEvent(makeEvent("sys", "SESSION", `demo session ${session.sessionId} terminated by user`));
    clearSession();
    router.push("/");
  };

  return (
    <div className={`vault lvl-${session.riskLevel}`}>
      <header className="page-head vault-head">
        <p className="tag">03 // RESTRICTED SEGMENT · DEMO SESSION</p>
        <h1 className="page-title">
          <span>VAULT</span> <span className="outline">OPEN</span>
        </h1>
        <div className="vault-actions">
          <span className="pill pill--live">SESSION ACTIVE · {formatDuration(now - session.startedAt)}</span>
          <button type="button" className="btn btn--danger" onClick={logout}>
            LOGOUT ⏻
          </button>
        </div>
      </header>

      <p className="vault-disclaimer">
        Demonstration state held in this tab&apos;s sessionStorage. It is not a server-secured session.
      </p>

      <div className="vault-grid">
        <Panel index="V1" title="IDENTITY">
          <Row k="AUTHENTICATED AS" v={session.identity} />
          <Row k="METHOD" v={session.method} />
          <Row k="LAST AUTHENTICATION" v={formatDateTime(session.startedAt)} />
        </Panel>

        <Panel index="V2" title="SESSION">
          <Row k="STATUS" v="ACTIVE (demo)" />
          <Row k="SESSION ID" v={session.sessionId} />
          <Row k="TOKEN (REDACTED)" v={redact(session.token, 5)} />
        </Panel>

        <Panel index="V3" title="CREDENTIAL">
          <Row k="CREDENTIAL ID (REDACTED)" v={redact(session.credentialId, 4)} />
          <Row k="ALGORITHM" v={cred?.algorithm ?? "ES256 (simulated)"} />
          <Row k="REGISTERED" v={formatDateTime(cred?.createdAt ?? null)} />
          <Row k="SIGN COUNTER" v={String(cred?.signCount ?? "—")} />
        </Panel>

        <Panel index="V4" title="DEVICE">
          <Row k="PLATFORM" v={cred?.device.platform ?? "unknown"} />
          <Row k="SCREEN" v={cred?.device.screen ?? "—"} />
          <Row k="LOCALE / TZ" v={cred ? `${cred.device.language} · ${cred.device.timezone}` : "—"} />
        </Panel>

        <Panel index="V5" title="RISK INDICATOR" tone={session.riskLevel}>
          <p className="verdict lvl-word">{session.riskLevel.toUpperCase()} · {session.riskScore}/100</p>
          <RiskSpectrum score={session.riskScore} level={session.riskLevel} />
          <Row k="STEP-UP USED" v={session.stepUpUsed ? "YES" : "NO"} />
        </Panel>

        <Panel index="V6" title="SECURITY EVENTS" className="vault-sec">
          {security.length === 0 ? (
            <p className="hint">No security events recorded in this tab.</p>
          ) : (
            <ul className="evlist">
              {security.map((e) => (
                <li key={e.id}>
                  <time>{formatDateTime(e.ts)}</time> <b>{e.tag}</b> {e.msg}
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel index="V7" title="AUTHENTICATION HISTORY" className="vault-hist">
          {history.length === 0 ? (
            <p className="hint">No attempts recorded.</p>
          ) : (
            <table className="hist">
              <thead>
                <tr><th>TIME</th><th>TYPE</th><th>OUTCOME</th><th>RISK</th></tr>
              </thead>
              <tbody>
                {history.slice(0, 10).map((h) => (
                  <tr key={h.id} className={`out-${h.outcome.toLowerCase()}`}>
                    <td>{formatDateTime(h.ts)}</td>
                    <td>{h.type}</td>
                    <td>{h.outcome}</td>
                    <td>{h.riskScore === null ? "—" : `${h.riskScore} ${h.riskLevel?.toUpperCase()}`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>

        <div className="vault-feed">
          <Terminal title="LIVE EVENT FEED // SIMULATED" events={feed} />
        </div>
      </div>
    </div>
  );
}
