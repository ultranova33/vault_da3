"use client";

import { useState } from "react";

/**
 * Simulated additional verification. The code is displayed on screen because the
 * demo has no SMS/email/authenticator backend to deliver it.
 */
export default function StepUpPrompt({
  code,
  error,
  attempts,
  maxAttempts = 3,
  onSubmit,
  onCancel,
}: {
  code: string;
  error: string | null;
  attempts: number;
  maxAttempts?: number;
  onSubmit: (value: string) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState("");
  return (
    <form
      className="stepup"
      onSubmit={(e) => {
        e.preventDefault();
        if (value.trim().length === 6) onSubmit(value);
      }}
    >
      <p className="stepup-title">STEP-UP VERIFICATION · ELEVATED RISK</p>
      <p className="stepup-note">
        No SMS or email backend exists in this demo, so the one-time code is shown here:
      </p>
      <output className="stepup-code" aria-label={`Demo code ${code.split("").join(" ")}`}>
        {code}
      </output>
      <label htmlFor="stepup-input">ENTER THE 6-DIGIT CODE</label>
      <input
        id="stepup-input"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        pattern="[0-9]{6}"
        value={value}
        onChange={(e) => setValue(e.target.value.replace(/\D/g, ""))}
        aria-describedby={error ? "stepup-error" : undefined}
        aria-invalid={!!error}
      />
      {error && (
        <p id="stepup-error" className="field-error" role="alert">
          {error} {maxAttempts - attempts} left.
        </p>
      )}
      <div className="row">
        <button type="submit" className="btn btn--primary" disabled={value.length !== 6}>
          VERIFY CODE →
        </button>
        <button type="button" className="btn btn--ghost" onClick={onCancel}>
          CANCEL
        </button>
      </div>
    </form>
  );
}
