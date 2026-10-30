/** Shared SVG filters. The warp filter is applied to display type on hover/selection. */
export default function SvgDefs() {
  return (
    <svg width="0" height="0" aria-hidden="true" focusable="false" style={{ position: "absolute" }}>
      <defs>
        <filter id="warp" x="-5%" y="-10%" width="110%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.008 0.04" numOctaves="2" seed="3" result="n">
            <animate
              attributeName="baseFrequency"
              dur="6s"
              values="0.008 0.04;0.014 0.07;0.008 0.04"
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="n" scale="26" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
  );
}
