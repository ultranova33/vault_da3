import type {
  AssertionResponse,
  CredentialRecord,
  DeviceMeta,
  RegistrationOptions,
} from "@/types/auth";
import {
  generateChallenge,
  generateId,
  randomBytes,
  toBase64Url,
  toHex,
} from "./challenge";

/**
 * SIMULATION ONLY. These functions mimic the *shape* of WebAuthn registration
 * and assertion objects. No navigator.credentials call is made, no key pair
 * exists, and no signature is ever produced or verified.
 */

export const IDENTITY_PATTERN = /^[a-z0-9._%+-]{3,64}(@[a-z0-9.-]+\.[a-z]{2,})?$/i;

export function collectDeviceMeta(): DeviceMeta {
  const nav = navigator as Navigator & { userAgentData?: { platform?: string } };
  return {
    platform: nav.userAgentData?.platform || navigator.platform || "unknown",
    userAgent: navigator.userAgent,
    screen: `${window.screen.width}×${window.screen.height}`,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "unknown",
  };
}

export function createRegistrationOptions(identity: string): RegistrationOptions {
  return {
    challenge: generateChallenge(),
    rp: { id: window.location.hostname || "localhost", name: "VAULT (simulated RP)" },
    user: { id: generateId("usr", 8), name: identity },
    pubKeyCredParams: [
      { type: "public-key", alg: -7 },
      { type: "public-key", alg: -257 },
    ],
    authenticatorSelection: {
      authenticatorAttachment: "platform",
      userVerification: "required",
      residentKey: "required",
    },
    attestation: "none",
    timeout: 60000,
  };
}

export function buildCredential(
  identity: string,
  options: RegistrationOptions,
  device: DeviceMeta,
): CredentialRecord {
  return {
    identity,
    credentialId: toBase64Url(randomBytes(24)),
    userHandle: options.user.id,
    rpId: options.rp.id,
    publicKeyFingerprint: toHex(randomBytes(16)),
    algorithm: "ES256 (simulated)",
    createdAt: Date.now(),
    lastUsedAt: null,
    signCount: 0,
    device,
    simulated: true,
  };
}

export function createAssertion(
  credential: CredentialRecord,
  challenge: string,
): AssertionResponse {
  return {
    credentialId: credential.credentialId,
    challenge,
    clientDataHash: toHex(randomBytes(16)),
    signCount: credential.signCount + 1,
    signature: toBase64Url(randomBytes(48)),
    simulated: true,
  };
}

/**
 * Structural check only: credential id, challenge echo and counter monotonicity.
 * This is NOT cryptographic signature verification.
 */
export function verifyAssertion(
  credential: CredentialRecord,
  challenge: string,
  assertion: AssertionResponse,
): boolean {
  return (
    assertion.credentialId === credential.credentialId &&
    assertion.challenge === challenge &&
    assertion.signCount > credential.signCount &&
    assertion.signature.length > 0
  );
}
