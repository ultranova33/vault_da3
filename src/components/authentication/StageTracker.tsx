export default function StageTracker({ stages, current }: { stages: string[]; current: number }) {
  return (
    <ol className="stages" aria-label="Progress">
      {stages.map((s, i) => {
        const state = i < current ? "done" : i === current ? "active" : "todo";
        return (
          <li key={s} className={`stage stage--${state}`} aria-current={state === "active" ? "step" : undefined}>
            <span className="stage-n">{String(i + 1).padStart(2, "0")}</span>
            <span className="stage-l">{s}</span>
          </li>
        );
      })}
    </ol>
  );
}
