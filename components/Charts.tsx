import type { ChartKind } from "@/lib/content";

type Pt = [number, number];

function smoothCmds(points: Pt[]): string {
  let d = "";
  for (let i = 0; i < points.length - 1; i++) {
    const [x0, y0] = points[i];
    const [x1, y1] = points[i + 1];
    const mx = (x0 + x1) / 2;
    const my = (y0 + y1) / 2;
    const c1x = (mx + x0) / 2;
    const c2x = (mx + x1) / 2;
    d += `Q${c1x},${y0} ${mx},${my}`;
    d += `Q${c2x},${y1} ${x1},${y1}`;
  }
  return d;
}

function smooth(points: Pt[]): string {
  if (points.length < 2) return "";
  return `M${points[0][0]},${points[0][1]}` + smoothCmds(points);
}

function seriesToPoints(
  values: number[],
  w: number,
  h: number,
  pad = 6
): Pt[] {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const step = (w - pad * 2) / (values.length - 1);
  return values.map((v, i): Pt => {
    const x = pad + i * step;
    const y = pad + (h - pad * 2) * (1 - (v - min) / range);
    return [x, y];
  });
}

function GridLines({ w, h, rows = 4 }: { w: number; h: number; rows?: number }) {
  const lines = [];
  for (let i = 1; i < rows; i++) {
    const y = (h / rows) * i;
    lines.push(
      <line
        key={i}
        x1={0}
        x2={w}
        y1={y}
        y2={y}
        stroke="rgba(244,241,234,0.06)"
        strokeWidth={1}
      />
    );
  }
  return <g>{lines}</g>;
}

export function LineChart({ animate = false }: { animate?: boolean }) {
  const w = 320;
  const h = 180;
  const a = seriesToPoints([20, 32, 28, 44, 38, 56, 52, 70, 64, 82], w, h);
  const b = seriesToPoints([42, 40, 48, 46, 54, 50, 60, 58, 67, 63], w, h);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-full w-full" aria-hidden="true">
      <GridLines w={w} h={h} />
      <path
        d={smooth(b)}
        fill="none"
        stroke="rgba(184,179,168,0.5)"
        strokeWidth={1.25}
      />
      <path
        d={smooth(a)}
        fill="none"
        stroke="#bfa46a"
        strokeWidth={1.75}
        className={animate ? "draw-line" : ""}
      />
      {a
        .filter((_, i) => i === a.length - 1)
        .map((p, i) => (
          <circle key={i} cx={p[0]} cy={p[1]} r={2.5} fill="#bfa46a" />
        ))}
    </svg>
  );
}

export function YieldCurve({ animate = false }: { animate?: boolean }) {
  const w = 320;
  const h = 180;
  const expectations = seriesToPoints(
    [30, 38, 46, 52, 56, 59, 61, 62],
    w,
    h
  );
  const total = seriesToPoints([34, 46, 58, 68, 76, 82, 86, 89], w, h);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-full w-full" aria-hidden="true">
      <GridLines w={w} h={h} />
      <path
        d={`${smooth(total)} L${total[total.length - 1][0]},${h} L${total[0][0]},${h} Z`}
        fill="rgba(191,164,106,0.07)"
        stroke="none"
      />
      <path
        d={smooth(expectations)}
        fill="none"
        stroke="rgba(184,179,168,0.55)"
        strokeWidth={1.25}
        strokeDasharray="3 3"
      />
      <path
        d={smooth(total)}
        fill="none"
        stroke="#bfa46a"
        strokeWidth={1.75}
        className={animate ? "draw-line" : ""}
      />
      {total.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r={1.8} fill="rgba(244,241,234,0.7)" />
      ))}
    </svg>
  );
}

export function VolatilityBands({ animate = false }: { animate?: boolean }) {
  const w = 320;
  const h = 180;
  const mid = seriesToPoints([46, 50, 44, 52, 48, 58, 50, 60, 54, 62], w, h);
  const upper = mid.map(([x, y]) => [x, y - 22] as Pt);
  const lower = mid.map(([x, y]) => [x, y + 22] as Pt);
  const rev = [...lower].reverse();
  const band = `${smooth(upper)} L${rev[0][0]},${rev[0][1]} ${smoothCmds(rev)} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-full w-full" aria-hidden="true">
      <GridLines w={w} h={h} />
      <path d={band} fill="rgba(191,164,106,0.08)" stroke="none" />
      <path
        d={smooth(upper)}
        fill="none"
        stroke="rgba(184,179,168,0.3)"
        strokeWidth={1}
      />
      <path
        d={smooth(lower)}
        fill="none"
        stroke="rgba(184,179,168,0.3)"
        strokeWidth={1}
      />
      <path
        d={smooth(mid)}
        fill="none"
        stroke="#bfa46a"
        strokeWidth={1.75}
        className={animate ? "draw-line" : ""}
      />
    </svg>
  );
}

export function DistributionCurve({ animate = false }: { animate?: boolean }) {
  const w = 320;
  const h = 180;
  const pad = 6;
  const mu = w / 2;
  const sigma = w / 8;
  const baseline = h - pad;
  const peak = pad + 14;
  const amp = baseline - peak;
  const pts: Pt[] = [];
  for (let i = 0; i <= 60; i++) {
    const x = pad + ((w - pad * 2) / 60) * i;
    const y = baseline - amp * Math.exp(-((x - mu) ** 2) / (2 * sigma ** 2));
    pts.push([x, y] as Pt);
  }
  const tailStart = mu + sigma * 1.1;
  const tail = pts.filter((p) => p[0] >= tailStart);
  const curvePath = smooth(pts);
  const areaPath = `${curvePath} L${pts[pts.length - 1][0]},${baseline} L${pts[0][0]},${baseline} Z`;
  const tailPath =
    tail.length > 1
      ? `${smooth(tail)} L${tail[tail.length - 1][0]},${baseline} L${tail[0][0]},${baseline} Z`
      : "";
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-full w-full" aria-hidden="true">
      <GridLines w={w} h={h} rows={3} />
      <path d={areaPath} fill="rgba(244,241,234,0.04)" />
      {tailPath && <path d={tailPath} fill="rgba(191,164,106,0.18)" />}
      <path
        d={curvePath}
        fill="none"
        stroke="#bfa46a"
        strokeWidth={1.6}
        className={animate ? "draw-line" : ""}
      />
      <line
        x1={tailStart}
        x2={tailStart}
        y1={pad}
        y2={baseline}
        stroke="rgba(184,179,168,0.3)"
        strokeDasharray="3 3"
        strokeWidth={1}
      />
    </svg>
  );
}

export function AllocationRing({
  segments,
}: {
  segments?: { label: string; value: number; color: string }[];
}) {
  const data =
    segments ??
    [
      { label: "Macro", value: 28, color: "#bfa46a" },
      { label: "Public", value: 24, color: "#d8c9a3" },
      { label: "Private", value: 20, color: "#8c6f3f" },
      { label: "Digital", value: 16, color: "#b8b3a8" },
      { label: "Cash", value: 12, color: "#3a3a3a" },
    ];
  const total = data.reduce((s, d) => s + d.value, 0);
  const size = 180;
  const r = 64;
  const cx = size / 2;
  const cy = size / 2;
  const C = 2 * Math.PI * r;
  let cum = 0;
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full" aria-hidden="true">
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="rgba(244,241,234,0.06)"
        strokeWidth={12}
      />
      <g transform={`rotate(-90 ${cx} ${cy})`}>
        {data.map((d, i) => {
          const frac = d.value / total;
          const dash = frac * C;
          const offset = -cum * C;
          cum += frac;
          return (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={d.color}
              strokeWidth={12}
              strokeDasharray={`${dash - 1.5} ${C - dash + 1.5}`}
              strokeDashoffset={offset}
              strokeLinecap="butt"
            />
          );
        })}
      </g>
      <text
        x={cx}
        y={cy - 2}
        textAnchor="middle"
        className="fill-ivory font-serif"
        style={{ fontSize: 20 }}
      >
        {total}%
      </text>
      <text
        x={cx}
        y={cy + 14}
        textAnchor="middle"
        style={{ fontSize: 7, letterSpacing: 2, fill: "#8e8e8e" }}
      >
        ALLOCATED
      </text>
    </svg>
  );
}

export function RiskMatrix() {
  const w = 200;
  const h = 200;
  const pad = 18;
  const dots: { x: number; y: number; r: number; gold?: boolean }[] = [
    { x: 0.7, y: 0.25, r: 7, gold: true },
    { x: 0.35, y: 0.4, r: 5 },
    { x: 0.55, y: 0.62, r: 6 },
    { x: 0.22, y: 0.72, r: 4 },
    { x: 0.8, y: 0.55, r: 5 },
    { x: 0.48, y: 0.32, r: 4 },
  ];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-full w-full" aria-hidden="true">
      <rect
        x={pad}
        y={pad}
        width={w - pad * 2}
        height={h - pad * 2}
        fill="none"
        stroke="rgba(244,241,234,0.08)"
      />
      <line
        x1={w / 2}
        x2={w / 2}
        y1={pad}
        y2={h - pad}
        stroke="rgba(244,241,234,0.06)"
        strokeDasharray="2 4"
      />
      <line
        x1={pad}
        x2={w - pad}
        y1={h / 2}
        y2={h / 2}
        stroke="rgba(244,241,234,0.06)"
        strokeDasharray="2 4"
      />
      {dots.map((d, i) => {
        const x = pad + d.x * (w - pad * 2);
        const y = pad + d.y * (h - pad * 2);
        return (
          <g key={i}>
            <circle
              cx={x}
              cy={y}
              r={d.r}
              fill={d.gold ? "rgba(191,164,106,0.18)" : "rgba(184,179,168,0.1)"}
              stroke={d.gold ? "#bfa46a" : "rgba(184,179,168,0.5)"}
            />
          </g>
        );
      })}
      <text x={pad} y={h - 4} style={{ fontSize: 7, letterSpacing: 2, fill: "#8e8e8e" }}>
        RISK →
      </text>
      <text
        x={6}
        y={pad + 6}
        style={{ fontSize: 7, letterSpacing: 2, fill: "#8e8e8e" }}
        transform={`rotate(-90 6 ${pad + 6})`}
      >
        RETURN →
      </text>
    </svg>
  );
}

export function Chart({
  kind,
  animate = false,
}: {
  kind: ChartKind;
  animate?: boolean;
}) {
  switch (kind) {
    case "yield":
      return <YieldCurve animate={animate} />;
    case "allocation":
      return <AllocationRing />;
    case "risk":
      return <RiskMatrix />;
    case "distribution":
      return <DistributionCurve animate={animate} />;
    case "bands":
      return <VolatilityBands animate={animate} />;
    case "line":
    default:
      return <LineChart animate={animate} />;
  }
}
