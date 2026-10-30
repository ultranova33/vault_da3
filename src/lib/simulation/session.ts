import type { CredentialRecord, SessionRecord } from "@/types/auth";
import type { RiskAssessment } from "@/types/risk";
import { generateId, randomBytes, toBase64Url } from "./challenge";

/** Creates a demo session object. It lives in sessionStorage only; nothing server-side backs it. */
export function createSession(
  credential: CredentialRecord,
  risk: RiskAssessment,
  stepUpUsed: boolean,
): SessionRecord {
  return {
    sessionId: generateId("sess", 8),
    token: `vltdemo.${toBase64Url(randomBytes(24))}`,
    identity: credential.identity,
    credentialId: credential.credentialId,
    startedAt: Date.now(),
    method: stepUpUsed
      ? "Passkey (simulated) + step-up code"
      : "Passkey (simulated platform authenticator)",
    riskScore: risk.score,
    riskLevel: risk.level,
    stepUpUsed,
    simulated: true,
  };
}
