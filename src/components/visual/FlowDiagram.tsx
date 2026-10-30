const STEPS = [
  { t: "IDENTITY INITIATION", d: "The user supplies a username or email. No password field exists.", a: "client → relying party" },
  { t: "PASSKEY REGISTRATION", d: "The device creates a new key pair for this one service, after the user confirms with a biometric or device PIN.", a: "navigator.credentials.create()" },
  { t: "DEVICE-BOUND CREDENTIAL", d: "The private key stays inside the device. Only the public key and a credential ID go to the institution.", a: "private key never leaves" },
  { t: "CHALLENGE GENERATION", d: "At each login the institution sends a fresh random challenge. It is single-use, so replaying an old response fails.", a: "32 random bytes / login" },
  { t: "USER VERIFICATION", d: "The device asks for a fingerprint, face or PIN. This check happens locally; the biometric is never sent.", a: "local to authenticator" },
  { t: "AUTHENTICATION DECISION", d: "The device signs the challenge together with the site origin. The institution checks the signature against the stored public key.", a: "navigator.credentials.get()" },
  { t: "RISK EVALUATION", d: "Device, location, timing and failure signals are scored. Low risk passes, medium asks for more, high is blocked.", a: "policy layer on top of FIDO" },
  { t: "SECURE SESSION", d: "Only after the checks above does the institution issue a session to the user.", a: "session issued by server" },
];

export default function FlowDiagram() {
  return (
    <ol className="flow">
      {STEPS.map((s, i) => (
        <li key={s.t} className={`flow-node ${i % 2 ? "r" : "l"}`}>
          <span className="flow-n">{String(i + 1).padStart(2, "0")}</span>
          <div className="flow-card">
            <h3>{s.t}</h3>
            <p>{s.d}</p>
            <code>{s.a}</code>
          </div>
          {i < STEPS.length - 1 && <span className="flow-arrow" aria-hidden="true">↓</span>}
        </li>
      ))}
    </ol>
  );
}
