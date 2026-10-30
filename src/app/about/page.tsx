import type { Metadata } from "next";
import Link from "next/link";
import FlowDiagram from "@/components/visual/FlowDiagram";
import Guilloche from "@/components/visual/Guilloche";
import IridescentStar from "@/components/visual/IridescentStar";
import Marquee from "@/components/visual/Marquee";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = { title: `How it works — ${BRAND}` };

const ADVANTAGES = [
  { k: "PHISHING RESISTANCE", v: "A passkey is scoped to the exact site (relying-party ID) that created it. A lookalike domain cannot receive a valid response, and there is no secret for the user to type into a fake page." },
  { k: "PUBLIC-KEY CRYPTOGRAPHY", v: "The institution stores only a public key. A database leak does not expose anything an attacker can replay to log in." },
  { k: "DEVICE-BOUND CREDENTIALS", v: "The private key lives in the device's secure hardware and is unlocked locally. Institutions can require device-bound keys; some passkeys sync across a user's devices, so policy should choose deliberately." },
  { k: "LESS PASSWORD DEPENDENCE", v: "Fewer passwords means fewer resets, fewer reuse attacks and less credential-stuffing exposure. Passwords can remain a fallback during migration." },
  { k: "CHALLENGE-RESPONSE", v: "Each login signs a fresh random challenge. Captured traffic from an earlier login cannot be replayed." },
  { k: "RISK-AWARE DECISIONS", v: "Passkeys prove who holds the key. A risk layer decides whether the context is trustworthy enough, and how much extra proof to ask for." },
];

export default function AboutPage() {
  return (
    <article className="about">
      <header className="ab-hero">
        <p className="tag">04 // HOW IT WORKS</p>
        <h1 className="page-title">
          <span>NO</span> <span className="outline">PASS</span> <span className="frag">word</span>
        </h1>
        <p className="ab-lede">
          {BRAND} is a demonstration of passwordless login for financial institutions: passkeys for strong identity, a risk engine for context, and a vault that opens only when both agree.
        </p>
        <Guilloche className="ab-guil" />
        <IridescentStar />
      </header>

      <section className="ab-sec ab-problem" aria-labelledby="s1">
        <p className="ab-no">01</p>
        <div>
          <h2 id="s1" className="ab-h">THE PROBLEM</h2>
          <div className="ab-cols">
            <p><b>Phishing.</b> A convincing fake login page collects the password and any one-time code typed into it, then replays them on the real site.</p>
            <p><b>Credential theft.</b> Passwords are shared secrets, so every server that stores one (even hashed) is a target. Breaches turn into stolen credentials.</p>
            <p><b>Reuse.</b> People reuse passwords across services, so one leak unlocks accounts elsewhere through credential stuffing.</p>
            <p><b>Friction.</b> Resets, lockouts, SMS codes and hardware tokens add cost for the institution and effort for customers, often at the moment they want to transact.</p>
          </div>
        </div>
      </section>

      <Marquee reverse items={["PHISHED", "REUSED", "LEAKED", "RESET", "LOCKED OUT", "STUFFED"]} />

      <section className="ab-sec" aria-labelledby="s2">
        <p className="ab-no">02</p>
        <div>
          <h2 id="s2" className="ab-h">OUR SOLUTION</h2>
          <p className="ab-big">
            Replace the shared secret with a <span className="frag">key pair</span> that never leaves the user&apos;s device.
          </p>
          <p className="ab-p">
            The user confirms with something they already use to unlock their phone or laptop: a fingerprint, a face scan or a PIN. The device then proves possession of its private key by signing a fresh challenge. The institution never sees a password and never receives the biometric. {BRAND} wraps that exchange with a risk engine, so the amount of proof scales with the danger of the situation.
          </p>
        </div>
      </section>

      <section className="ab-sec ab-flow" aria-labelledby="s3">
        <p className="ab-no">03</p>
        <div>
          <h2 id="s3" className="ab-h">HOW THE FLOW WORKS</h2>
          <FlowDiagram />
        </div>
      </section>

      <section className="ab-sec" aria-labelledby="s4">
        <p className="ab-no">04</p>
        <div>
          <h2 id="s4" className="ab-h">RISK-BASED AUTHENTICATION</h2>
          <div className="ab-risk">
            <div className="ab-lvl lvl-low"><strong>LOW</strong><span>0–30</span><p>Seamless. A recognised device and normal behaviour need only the passkey.</p></div>
            <div className="ab-lvl lvl-medium"><strong>MEDIUM</strong><span>31–65</span><p>Additional verification. A new device or odd hour triggers a step-up before access.</p></div>
            <div className="ab-lvl lvl-high"><strong>HIGH</strong><span>66–100</span><p>Blocked. An unknown credential, hostile origin or repeated failures are denied and logged.</p></div>
          </div>
          <p className="ab-p">
            Financial institutions face different loss profiles for different sessions. A uniform challenge either burdens every honest customer or under-protects the risky moment. Scoring context lets the institution keep routine logins smooth, spend friction where fraud is likely, and produce an auditable security event when it refuses access. <Link href="/risk">Try the three scenarios →</Link>
          </p>
        </div>
      </section>

      <section className="ab-sec ab-adv" aria-labelledby="s5">
        <p className="ab-no">05</p>
        <div>
          <h2 id="s5" className="ab-h">SECURITY ADVANTAGES</h2>
          <dl className="ab-grid">
            {ADVANTAGES.map((a, i) => (
              <div key={a.k} className="ab-item">
                <dt><small>{String(i + 1).padStart(2, "0")}</small>{a.k}</dt>
                <dd>{a.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="ab-sec" aria-labelledby="s6">
        <p className="ab-no">06</p>
        <div>
          <h2 id="s6" className="ab-h">FINANCIAL INSTITUTION INTEGRATION</h2>
          <p className="ab-p">
            The proposal is a modular authentication layer, not a rebuild. Institutions would keep their existing identity provider, customer records and session management, and add three pieces in front of them: a passkey registration and assertion service, a risk-scoring policy, and a step-up hook that maps to whatever additional verification they already operate (for example an OTP or in-app approval). Because passkeys follow open FIDO2/WebAuthn standards, support already exists in current browsers and mobile platforms, so institutions avoid issuing proprietary hardware tokens. This describes a concept; this repository does not implement it.
          </p>
          <ul className="ab-int">
            <li><b>REGISTER</b> existing customers enrol a passkey after a normal login</li>
            <li><b>ASSERT</b> relying party verifies the signed challenge</li>
            <li><b>SCORE</b> risk policy picks allow, step-up or block</li>
            <li><b>ISSUE</b> existing session service takes over</li>
          </ul>
        </div>
      </section>

      <section className="ab-sec ab-disc" aria-labelledby="s7">
        <p className="ab-no">07</p>
        <div className="ab-warn" role="note">
          <h2 id="s7" className="ab-h">DEMONSTRATION DISCLAIMER</h2>
          <p>
            This hackathon build is a <b>frontend-only simulation</b>. It does <b>not</b> call the WebAuthn API, create real key pairs, verify cryptographic signatures, read a fingerprint or face, or talk to any server. Challenges and identifiers are random values from the browser, the biometric prompt is a button, and the risk scenarios are fixed examples. Session data lives in this tab&apos;s sessionStorage and disappears when it closes. It is not production-grade authentication and must not be used to protect real accounts.
          </p>
          <ul className="ab-sim">
            <li><b>NO BACKEND</b>Everything runs client-side in the browser; there is no authentication server and no API.</li>
            <li><b>NO DATABASE</b>Credentials and sessions are demo objects in sessionStorage, cleared when the tab closes.</li>
            <li><b>NO REAL BIOMETRICS</b>The biometric prompt is a button. No sensor is read and no WebAuthn call is made.</li>
          </ul>
        </div>
      </section>

      <p className="ab-end">
        <Link href="/authenticate?intent=demo" className="btn btn--primary">RUN THE DEMO →</Link>
        <Link href="/" className="btn btn--ghost">BACK TO GATEWAY</Link>
      </p>
    </article>
  );
}
