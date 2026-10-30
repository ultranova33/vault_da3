"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import GlitchText from "@/components/visual/GlitchText";

export default function SuccessOverlay({ riskScore }: { riskScore: number | null }) {
  const router = useRouter();

  useEffect(() => {
    const t = window.setTimeout(() => router.push("/vault"), 2600);
    return () => window.clearTimeout(t);
  }, [router]);

  return (
    <div className="grant" role="status" aria-live="polite">
      <p className="tag">DEMO AUTHENTICATION COMPLETE{riskScore !== null ? ` · RISK ${riskScore}/100` : ""}</p>
      <GlitchText as="h2" text="ACCESS GRANTED" className="grant-title" />
      <p className="grant-note">Entering the demo vault… (simulated session, client-side only)</p>
      <div className="grant-bar" aria-hidden="true">
        <i />
      </div>
      <Link href="/vault" className="btn btn--primary">
        ENTER VAULT NOW →
      </Link>
    </div>
  );
}
