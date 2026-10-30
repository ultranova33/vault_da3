"use client";

import { useEffect, useRef } from "react";

/** Decorative crosshair + live coordinates. Fine pointers only; skipped for reduced motion. */
export default function CrosshairCursor() {
  const ref = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const el = ref.current;
    if (!fine || reduce || !el) return;
    el.dataset.on = "true";
    let raf = 0;
    const move = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
        if (label.current) {
          label.current.textContent = `${String(Math.round(e.clientX)).padStart(4, "0")}:${String(Math.round(e.clientY)).padStart(4, "0")}`;
        }
        const t = e.target as HTMLElement | null;
        el.dataset.hot = t?.closest("a,button,input,[role='radio']") ? "true" : "false";
      });
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
    };
  }, []);

  return (
    <div ref={ref} className="xhair" aria-hidden="true" data-on="false" data-hot="false">
      <i />
      <span ref={label} />
    </div>
  );
}
