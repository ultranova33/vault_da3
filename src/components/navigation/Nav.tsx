"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useHydrated, useSession } from "@/hooks/useStored";
import { resetAll } from "@/lib/simulation/store";

const ITEMS = [
  { href: "/", label: "GATEWAY", code: "00" },
  { href: "/authenticate", label: "AUTHENTICATE", code: "01" },
  { href: "/risk", label: "RISK ENGINE", code: "02" },
  { href: "/vault", label: "VAULT", code: "03" },
  { href: "/about", label: "HOW IT WORKS", code: "04" },
];

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const hydrated = useHydrated();
  const session = useSession();
  const active = hydrated && !!session;

  const reset = () => {
    resetAll();
    setOpen(false);
    router.push("/");
  };

  return (
    <header className="nav">
      <Link href="/" className="nav-brand" onClick={() => setOpen(false)} aria-label="VAULT gateway">
        <span className="nav-mark" aria-hidden="true">
          ▚
        </span>
        VAULT<em>/</em>
      </Link>

      <button
        type="button"
        className="nav-toggle"
        aria-expanded={open}
        aria-controls="nav-links"
        onClick={() => setOpen((o) => !o)}
      >
        {open ? "CLOSE ✕" : "MENU ≡"}
      </button>

      <nav id="nav-links" className={`nav-links ${open ? "is-open" : ""}`} aria-label="Primary">
        {ITEMS.map((it) => {
          const current = it.href === "/" ? pathname === "/" : pathname.startsWith(it.href);
          return (
            <Link
              key={it.href}
              href={it.href}
              aria-current={current ? "page" : undefined}
              className="nav-link"
              onClick={() => setOpen(false)}
            >
              <small>{it.code}</small>
              {it.label}
              {it.href === "/vault" && active && <i className="nav-live" title="session active" />}
            </Link>
          );
        })}
        <button type="button" className="nav-reset" onClick={reset} title="Clear all demo state in this tab">
          RESET ⟲
        </button>
      </nav>
    </header>
  );
}
