import type { Metadata } from "next";
import VaultView from "@/components/vault/VaultView";

export const metadata: Metadata = { title: "Secured Vault — VAULT" };

export default function VaultPage() {
  return <VaultView />;
}
