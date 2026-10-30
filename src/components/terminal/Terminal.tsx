"use client";

import { useEffect, useRef } from "react";
import type { SimEvent } from "@/types/auth";
import { formatClock } from "@/lib/simulation/format";

export default function Terminal({
  events,
  title,
  empty = "awaiting events…",
  onClear,
  className = "",
}: {
  events: SimEvent[];
  title: string;
  empty?: string;
  onClear?: () => void;
  className?: string;
}) {
  const body = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = body.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [events.length]);

  return (
    <div className={`term ${className}`}>
      <div className="term-bar">
        <span>
          <i className="term-dot" /> {title}
        </span>
        {onClear && events.length > 0 && (
          <button type="button" onClick={onClear} className="term-clear">
            CLEAR
          </button>
        )}
      </div>
      <div ref={body} className="term-body" role="log" aria-live="polite" aria-label={title} tabIndex={0}>
        {events.length === 0 && <p className="term-empty">{empty}</p>}
        {events.map((e) => (
          <p key={e.id} className={`term-line term-${e.level}`}>
            <time>{formatClock(e.ts)}</time>
            <b>{e.tag}</b>
            <span>{e.msg}</span>
          </p>
        ))}
        <span className="term-caret" aria-hidden="true">
          █
        </span>
      </div>
    </div>
  );
}
