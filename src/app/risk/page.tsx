import type { Metadata } from "next";
import RiskSimulator from "@/components/risk/RiskSimulator";

export const metadata: Metadata = { title: "Risk Engine — VAULT" };

export default function RiskPage() {
  return <RiskSimulator />;
}
