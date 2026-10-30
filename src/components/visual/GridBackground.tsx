/** Fixed technical backdrop: perspective floor grid, noise, scanline. Pure CSS. */
export default function GridBackground() {
  return (
    <div className="bg" aria-hidden="true">
      <div className="bg-floor" />
      <div className="bg-vgrid" />
      <div className="bg-noise" />
      <div className="bg-scan" />
      <div className="bg-vignette" />
    </div>
  );
}
