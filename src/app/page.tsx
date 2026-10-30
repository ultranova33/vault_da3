import Link from "next/link";
import LiveReadout from "@/components/gateway/LiveReadout";
import StatusBadge from "@/components/gateway/StatusBadge";
import Guilloche from "@/components/visual/Guilloche";
import Marquee from "@/components/visual/Marquee";
import IridescentStar from "@/components/visual/IridescentStar";
import { BRAND, BRAND_LOCKUP } from "@/lib/brand";

const CTAS = [
  { n: "01", label: "REGISTER PASSKEY", sub: "Create a simulated device-bound credential", href: "/authenticate?intent=register", primary: true },
  { n: "02", label: "AUTHENTICATE", sub: "Run the challenge-response handshake", href: "/authenticate?intent=login" },
  { n: "03", label: "DEMO MODE", sub: "Full journey in one automatic run", href: "/authenticate?intent=demo" },
];

const BANDS = [
  { level: "low", word: "SEAMLESS", range: "0–30", text: "Known device, known credential. Passkey only, zero friction." },
  { level: "medium", word: "STEP-UP", range: "31–65", text: "New device, odd hour. Extra verification before access." },
  { level: "high", word: "BLOCKED", range: "66–100", text: "Unknown credential, hostile origin. Denied, event raised." },
] as const;

export default function GatewayPage() {
  return (
    <div className="gw">
      <section className="gw-hero" aria-labelledby="gw-title">
        <div className="gw-cells" aria-hidden="true">
          {["D1", "E1", "F1", "D2", "E2", "F2", "D3", "E3", "F3"].map((c) => (
            <span key={c}>{c}</span>
          ))}
        </div>
        <svg className="gw-orbits" viewBox="0 0 1000 700" preserveAspectRatio="none" aria-hidden="true">
          <ellipse cx="500" cy="350" rx="430" ry="230" transform="rotate(-24 500 350)" />
          <ellipse cx="500" cy="350" rx="430" ry="230" transform="rotate(24 500 350)" />
        </svg>
        <div className="gw-strip">
          <span>SYS // AUTH-LAYER / v0.1</span>
          <span className="ticks" aria-hidden="true" />
        </div>

        <div className="gw-stage">
          <div className="gw-left">
            <h1 id="gw-title" className="gw-title" aria-label={BRAND}>
              <span className="gw-a" aria-hidden="true">{BRAND_LOCKUP[0]}</span>
              <span className="gw-b" aria-hidden="true">{BRAND_LOCKUP[1]}</span>
            </h1>
            <p className="gw-pitch">
              Passwords are the breach. <span className="frag">your device</span> is the key.
            </p>
            <p className="gw-sub">
              Passkey login with a live risk engine, built as a modular layer for banks and fintechs. Explore the full flow below.
            </p>
          </div>

          <div className="gw-seal" aria-hidden="true">
            <span className="gw-corner tl">USER</span>
            <span className="gw-corner tr">UNVERIFIED</span>
            <Guilloche className="gw-guil" />
            <IridescentStar className="gw-star" />
            <span className="callout c1">challenge</span>
            <span className="callout c2">private key</span>
            <span className="callout c3">origin-bound</span>
            <span className="gw-corner bl">ASSERTION // PENDING</span>
            <span className="gw-corner br barcode" />
          </div>
        </div>

        <nav className="gw-cta" aria-label="Start the demonstration">
          {CTAS.map((c) => (
            <Link key={c.n} href={c.href} className={`cta ${c.primary ? "cta--primary" : ""}`}>
              <small>{c.n}</small>
              <strong>{c.label}</strong>
              <span>{c.sub}</span>
              <i aria-hidden="true">→</i>
            </Link>
          ))}
        </nav>
        <p className="gw-links">
          <Link href="/about">HOW IT WORKS →</Link>
          <Link href="/risk">RISK SIMULATOR →</Link>
        </p>
      </section>

      <Marquee items={["NO PASSWORD", "NO SHARED SECRET", "ORIGIN-BOUND CREDENTIALS", "CHALLENGE-RESPONSE", "RISK-AWARE", "PHISHING-RESISTANT BY DESIGN"]} />

      <section className="gw-grid">
        <div className="gw-problem paper">
          <p className="tag">THE PROBLEM</p>
          <h2 className="gw-h2">
            Every password is a <span className="frag">liability</span> a bank has to guard.
          </h2>
          <ol className="gw-pain">
            <li><b>PHISHED</b> Users type secrets into convincing fake pages.</li>
            <li><b>REUSED</b> One breached site unlocks many accounts.</li>
            <li><b>TOKEN COST</b> Hardware tokens are costly to issue, ship and replace.</li>
            <li><b>FRICTION</b> Resets and OTP loops push customers away.</li>
          </ol>
          <p className="gw-type">
            Passkeys replace the shared secret with a per-site key pair that stays on the user&apos;s device. A risk engine then decides how much proof each login needs.
          </p>
        </div>

        <div className="gw-side">
          <StatusBadge />
          <LiveReadout />
        </div>
      </section>

      <section className="gw-bands" aria-label="Risk outcomes">
        {BANDS.map((b) => (
          <Link key={b.level} href="/risk" className={`band lvl-${b.level}`}>
            <span className="band-range">RISK {b.range}</span>
            <strong>{b.word}</strong>
            <span className="band-text">{b.text}</span>
          </Link>
        ))}
      </section>
    </div>
  );
}
