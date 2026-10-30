export default function Marquee({ items, reverse = false }: { items: string[]; reverse?: boolean }) {
  const row = items.map((t, i) => (
    <span key={i}>
      {t}
      <b aria-hidden="true"> ✕ </b>
    </span>
  ));
  return (
    <div className={`marquee ${reverse ? "marquee--rev" : ""}`} aria-hidden="true">
      <div className="marquee-track">
        {row}
        {row}
      </div>
    </div>
  );
}
