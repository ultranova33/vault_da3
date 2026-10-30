# VAULT: Passwordless Authentication Demo

An interactive, frontend-only demonstration of passwordless authentication for financial institutions: passkey-style registration and login, a challenge-response handshake, a three-level risk engine, and a gated demo vault.

> **This is a simulation.** It does not call the WebAuthn API, create real key pairs, verify cryptographic signatures, read biometrics, or talk to any server. Do not use it to protect real accounts.

## What's in it

| Page | Route | What it does |
|---|---|---|
| Gateway | `/` | Landing page with live readout, status indicator and entry points |
| Authenticate | `/authenticate` | Guided journey: identify → register passkey → authentication handshake → access |
| Risk Engine | `/risk` | Switch between LOW / MEDIUM / HIGH scenarios and trigger the security response |
| Vault | `/vault` | Post-authentication view (identity, session, credential, risk, events, history). Locked without a session |
| How It Works | `/about` | Problem, solution, flow diagram, risk levels, security advantages, integration, disclaimer |

### Risk outcomes

| Level | Score | Decision |
|---|---|---|
| LOW | 0–30 | Allow: passkey only |
| MEDIUM | 31–65 | Step-up: access only after a demo one-time code is entered |
| HIGH | 66–100 | Block: no session, security event logged |

The selected scenario is shared between the Authenticate and Risk pages, so a judge can pick a context on `/risk` and run the full journey on `/authenticate`.

### Trying it quickly

1. Open `/authenticate` and choose **Demo Mode** to run register + authenticate automatically.
2. Switch the simulated context (LOW / MEDIUM / HIGH) first to see the three outcomes.
3. Use **Register Passkey** then **Authenticate** for the manual flow with the biometric prompt (including cancel and *simulate mismatch*).
4. **Reset** in the top bar clears all demo state in the tab.

## What is real and what is simulated

- **Real:** random challenges, credential IDs and session IDs come from `crypto.getRandomValues()`.
- **Simulated:** the biometric prompt (a button), the "signature" (random bytes), assertion verification (a structural check only), the risk signals (fixed scenarios), the step-up code (shown on screen), and the vault session (a client-side object).
- **Storage:** `sessionStorage` only. State disappears when the tab closes.

## Tech stack

- Next.js (App Router), React, TypeScript
- Plain CSS (no UI framework)
- Fonts via `next/font/google`: Anybody, Climate Crisis, Kode Mono
- No backend, no database, no environment variables

## Project structure

```
src/
  app/            routes (page.tsx, authenticate, risk, vault, about) + layout, global CSS
  components/     navigation, gateway, authentication, terminal, risk, vault, visual
  hooks/          useAuthSimulation, useRiskSimulation, useStored, useAnimatedNumber
  lib/
    brand.ts      product name (change here to rebrand)
    simulation/   challenge, passkey, risk-engine, session, event-engine, store, format
  styles/         components.css, pages.css, theme.css
  types/          auth.ts, risk.ts
```

Simulation logic (`lib/simulation`) is kept separate from presentation so it can be restyled or swapped without touching the UI.

## Run locally

```bash
npm install
npm run dev      # http://localhost:3000
```

```bash
npm run build    # production build
npm run lint
```

## Deploy to Vercel

No configuration needed.

1. Import this repository at [vercel.com/new](https://vercel.com/new).
2. Keep the defaults (framework: Next.js, build command: `npm run build`).
3. Deploy. No environment variables are required.

Fonts are fetched at build time, so the build machine needs network access (Vercel has it).

## Accessibility

Keyboard navigable, skip link, labelled controls and live regions for the terminals, and `prefers-reduced-motion` support (animations and the custom cursor are disabled). Layouts are responsive down to phone width.
