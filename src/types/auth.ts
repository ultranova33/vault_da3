import type { RiskLevel } from "./risk";

export type EventLevel = "sys" | "info" | "ok" | "warn" | "error";

export interface SimEvent {
  id: string;
  ts: number;
  level: EventLevel;
  tag: string;
  msg: string;
}

export interface DeviceMeta {
  platform: string;
  userAgent: string;
  screen: string;
  language: string;
  timezone: string;
}

export interface RegistrationOptions {
  challenge: string;
  rp: { id: string; name: string };
  user: { id: string; name: string };
  pubKeyCredParams: { type: "public-key"; alg: number }[];
  authenticatorSelection: {
    authenticatorAttachment: "platform";
    userVerification: "required";
    residentKey: "required";
  };
  attestation: "none";
  timeout: number;
}

export interface CredentialRecord {
  identity: string;
  credentialId: string;
  userHandle: string;
  rpId: string;
  publicKeyFingerprint: string;
  algorithm: string;
  createdAt: number;
  lastUsedAt: number | null;
  signCount: number;
  device: DeviceMeta;
  simulated: true;
}

export interface AssertionResponse {
  credentialId: string;
  challenge: string;
  clientDataHash: string;
  signCount: number;
  signature: string;
  simulated: true;
}

export interface SessionRecord {
  sessionId: string;
  token: string;
  identity: string;
  credentialId: string;
  startedAt: number;
  method: string;
  riskScore: number;
  riskLevel: RiskLevel;
  stepUpUsed: boolean;
  simulated: true;
}

export type HistoryOutcome = "SUCCESS" | "FAILURE" | "BLOCKED" | "CANCELLED";

export interface HistoryEntry {
  id: string;
  ts: number;
  identity: string;
  type: "REGISTER" | "AUTHENTICATE";
  outcome: HistoryOutcome;
  method: string;
  riskScore: number | null;
  riskLevel: RiskLevel | null;
}
