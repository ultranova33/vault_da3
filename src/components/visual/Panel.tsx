import type { ReactNode } from "react";

/** Bracketed technical panel with an index tag. */
export default function Panel({
  index,
  title,
  children,
  className = "",
  tone,
}: {
  index?: string;
  title: string;
  children: ReactNode;
  className?: string;
  tone?: "low" | "medium" | "high";
}) {
  return (
    <section className={`panel ${tone ? `lvl-${tone}` : ""} ${className}`}>
      <header className="panel-head">
        {index && <span className="panel-idx">{index}</span>}
        <h2>{title}</h2>
      </header>
      <div className="panel-body">{children}</div>
    </section>
  );
}
