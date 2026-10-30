/** Ringed planet + four-point star, echoing the orbit motifs in the references. */
export default function Orbit({ className = "" }: { className?: string }) {
  return (
    <svg className={`orbit ${className}`} viewBox="0 0 300 200" aria-hidden="true">
      <circle cx="150" cy="100" r="52" fill="var(--acid)" />
      <ellipse cx="150" cy="100" rx="128" ry="26" transform="rotate(-16 150 100)" fill="none" stroke="var(--chrome)" strokeWidth="3" />
      <path d="M150 54 C150 54 160 100 150 146 C150 146 140 100 150 54Z" fill="var(--void)" opacity=".18" />
      <path d="M262 30 l5 14 l14 5 l-14 5 l-5 14 l-5 -14 l-14 -5 l14 -5z" fill="var(--chrome)" />
      <path d="M40 150 l3 8 l8 3 l-8 3 l-3 8 l-3 -8 l-8 -3 l8 -3z" fill="var(--chrome)" />
    </svg>
  );
}
