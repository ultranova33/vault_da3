/** Random primitives. Everything here is backed by crypto.getRandomValues(). */

export function randomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
}

export function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function toBase64Url(bytes: Uint8Array): string {
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** 32-byte random challenge, base64url encoded (same shape a WebAuthn RP would send). */
export function generateChallenge(): string {
  return toBase64Url(randomBytes(32));
}

export function generateId(prefix: string, bytes = 8): string {
  return `${prefix}_${toHex(randomBytes(bytes))}`;
}

/** 6-digit demo step-up code. */
export function generateOtp(): string {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return String(buf[0] % 1_000_000).padStart(6, "0");
}
