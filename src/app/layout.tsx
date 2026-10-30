import type { Metadata, Viewport } from "next";
import { Anybody, Climate_Crisis, Kode_Mono } from "next/font/google";
import "./globals.css";
import "../styles/components.css";
import "../styles/pages.css";
import "../styles/theme.css";
import Nav from "@/components/navigation/Nav";
import Footer from "@/components/navigation/Footer";
import GridBackground from "@/components/visual/GridBackground";
import CrosshairCursor from "@/components/visual/CrosshairCursor";
import SvgDefs from "@/components/visual/SvgDefs";
import { BRAND } from "@/lib/brand";

/* Variable-width grotesque: condensed numerals through ultra-expanded wordmarks. */
const disp = Anybody({ subsets: ["latin"], weight: "variable", axes: ["wdth"], variable: "--font-disp", display: "swap" });
/* Melting display face: the YEAR axis warps the letterforms (animated on the hero). */
const melt = Climate_Crisis({ subsets: ["latin"], variable: "--font-melt", display: "swap" });
/* Technical mono for body, labels and terminals. */
const mono = Kode_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: `${BRAND} — Passwordless Authentication Simulation`,
  description:
    "Frontend-only interactive simulation of passkey-based, risk-aware passwordless authentication for financial institutions. Not production authentication.",
};

export const viewport: Viewport = {
  themeColor: "#030303",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${disp.variable} ${melt.variable} ${mono.variable}`}>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <SvgDefs />
        <GridBackground />
        <CrosshairCursor />
        <Nav />
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
