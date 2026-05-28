/**
 * Shaped halftone illustrations — a grid of dots whose radius/opacity is
 * driven by a shape's height profile. Echoes the Gauss "pillars" dot shapes.
 * Pure SVG, server-renderable.
 */

export type HalftoneShape = "dome" | "mountain" | "pyramid" | "bars";

function intensityAt(shape: HalftoneShape, nx: number, ny: number): number {
  // nx,ny normalized 0..1; ny=0 top, ny=1 baseline
  const fade = (top: number) =>
    ny < top ? 0 : 0.35 + 0.65 * ((ny - top) / (1 - top + 1e-3));

  switch (shape) {
    case "dome": {
      const peak = Math.exp(-Math.pow((nx - 0.5) / 0.26, 2)) * 0.92;
      return fade(1 - peak);
    }
    case "mountain": {
      const p1 = Math.max(0, 1 - Math.abs(nx - 0.4) / 0.36) * 0.82;
      const p2 = Math.max(0, 1 - Math.abs(nx - 0.66) / 0.3) * 0.64;
      return fade(1 - Math.max(p1, p2));
    }
    case "pyramid": {
      const tri = Math.max(0, 1 - Math.abs(nx - 0.5) / 0.44) * 0.86;
      const base = fade(1 - tri);
      // thin vertical "antenna" rising from the apex
      const antenna =
        Math.abs(nx - 0.5) < 0.012 && ny < 1 - tri && ny > 0.08 ? 0.7 : 0;
      return Math.max(base, antenna);
    }
    case "bars": {
      const heights = [0.34, 0.52, 0.42, 0.66, 0.95, 0.58, 0.46, 0.36];
      const gapEvery = 1 / heights.length;
      const bi = Math.min(heights.length - 1, Math.floor(nx / gapEvery));
      // small gaps between bars
      const within = (nx % gapEvery) / gapEvery;
      if (within > 0.84) return 0;
      return fade(1 - heights[bi]);
    }
  }
}

export function Halftone({
  shape,
  className = "",
}: {
  shape: HalftoneShape;
  className?: string;
}) {
  const W = 240;
  const H = 150;
  const gap = 5.5;
  const dots: React.ReactElement[] = [];

  for (let y = gap / 2; y < H; y += gap) {
    for (let x = gap / 2; x < W; x += gap) {
      const it = intensityAt(shape, x / W, y / H);
      if (it <= 0.04) continue;
      dots.push(
        <circle
          key={`${x}-${y}`}
          cx={x.toFixed(1)}
          cy={y.toFixed(1)}
          r={(0.5 + it * 1.55).toFixed(2)}
          fillOpacity={(0.25 + it * 0.7).toFixed(2)}
        />
      );
    }
  }

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={className}
      fill="currentColor"
      aria-hidden="true"
      preserveAspectRatio="xMidYMax meet"
    >
      {dots}
    </svg>
  );
}
