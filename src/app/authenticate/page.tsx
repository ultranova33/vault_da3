import { Suspense } from "react";
import type { Metadata } from "next";
import AuthExperience from "@/components/authentication/AuthExperience";

export const metadata: Metadata = { title: "Authenticate — VAULT" };

export default function AuthenticatePage() {
  return (
    <Suspense fallback={<p className="loading">INITIALISING HANDSHAKE…</p>}>
      <AuthExperience />
    </Suspense>
  );
}
