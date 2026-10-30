"use client";

import { useEffect, useRef, useState } from "react";
import type { PromptKind, PromptResult } from "@/hooks/useAuthSimulation";

/** Fake platform-authenticator dialog. No sensor is read; "scanning" is a timer. */
export default function BiometricPrompt({
  kind,
  onRespond,
}: {
  kind: PromptKind;
  onRespond: (r: PromptResult) => void;
}) {
  const [scanning, setScanning] = useState(false);
  const pad = useRef<HTMLButtonElement>(null);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    pad.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !timer.current) onRespond("cancel");
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [onRespond]);

  const scan = () => {
    if (scanning) return;
    setScanning(true);
    timer.current = window.setTimeout(() => onRespond("confirm"), 1300);
  };

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby="bio-title">
      <div className="modal-card">
        <p className="tag">SIMULATED PLATFORM AUTHENTICATOR</p>
        <h2 id="bio-title">{kind === "register" ? "CREATE PASSKEY" : "VERIFY IT'S YOU"}</h2>
        <p className="modal-note">
          No sensor is read. Pressing the pad stands in for a fingerprint, face or device-PIN check.
        </p>
        <button
          ref={pad}
          type="button"
          className={`bio-pad ${scanning ? "is-scanning" : ""}`}
          onClick={scan}
          disabled={scanning}
          aria-label={scanning ? "Scanning" : "Touch to confirm biometric"}
        >
          <span className="bio-rings" aria-hidden="true" />
          <span className="bio-print" aria-hidden="true">
            ◉
          </span>
          <span className="bio-label">{scanning ? "SCANNING…" : "TOUCH TO CONFIRM"}</span>
        </button>
        <div className="row">
          <button type="button" className="btn btn--ghost" disabled={scanning} onClick={() => onRespond("cancel")}>
            CANCEL
          </button>
          <button type="button" className="btn btn--warn" disabled={scanning} onClick={() => onRespond("mismatch")}>
            SIMULATE MISMATCH
          </button>
        </div>
      </div>
    </div>
  );
}
