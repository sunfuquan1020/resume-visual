import type { Skill } from "@/lib/schema/resume";
import { seriesColor } from "@/components/viz/palette";

interface Placed {
  x: number;
  y: number;
  r: number;
  name: string;
  color: string;
}

/**
 * Packed-bubble chart: bubble area ∝ skill proficiency. A signature Tableau
 * "experience" panel. Uses a lightweight greedy spiral packing (no d3 dep).
 */
export function PackedBubbles({
  skills,
  size = 320,
}: {
  skills: Skill[];
  size?: number;
}) {
  const data = skills.slice(0, 12);
  if (data.length < 2) return null;

  const placed = pack(
    data.map((s, i) => ({
      r: radius(s.level),
      name: s.name,
      color: seriesColor(i),
    })),
  );

  // Fit all bubbles into the viewBox.
  const minX = Math.min(...placed.map((p) => p.x - p.r));
  const maxX = Math.max(...placed.map((p) => p.x + p.r));
  const minY = Math.min(...placed.map((p) => p.y - p.r));
  const maxY = Math.max(...placed.map((p) => p.y + p.r));
  const w = maxX - minX;
  const h = maxY - minY;
  const scale = Math.min(size / w, size / h) * 0.96;
  const offX = (size - w * scale) / 2 - minX * scale;
  const offY = (size - h * scale) / 2 - minY * scale;

  return (
    <svg viewBox={`0 0 ${size} ${size}`} style={{ width: "100%", height: "auto" }} role="img" aria-label="Skill usage bubbles">
      {placed.map((p, i) => {
        const cx = p.x * scale + offX;
        const cy = p.y * scale + offY;
        const r = p.r * scale;
        const fontSize = Math.min(15, Math.max(8, r * 0.42));
        const showLabel = r > 16;
        return (
          <g key={i}>
            <circle cx={cx} cy={cy} r={r} fill={p.color} fillOpacity={0.88} />
            {showLabel && (
              <text
                x={cx}
                y={cy}
                fontSize={fontSize}
                fill="#ffffff"
                fontWeight={600}
                textAnchor="middle"
                dominantBaseline="central"
              >
                {fit(p.name, r, fontSize)}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function radius(level: number): number {
  // sqrt scale so area (not radius) tracks proficiency.
  return 14 + Math.sqrt(Math.max(0, Math.min(100, level)) / 100) * 34;
}

/** Greedy spiral packing: place largest first, spiral outward avoiding overlap. */
function pack(circles: Omit<Placed, "x" | "y">[]): Placed[] {
  const sorted = [...circles].sort((a, b) => b.r - a.r);
  const placed: Placed[] = [];
  for (const c of sorted) {
    if (placed.length === 0) {
      placed.push({ ...c, x: 0, y: 0 });
      continue;
    }
    let a = 0;
    const step = 0.25;
    let spot = { x: 0, y: 0 };
    for (let i = 0; i < 4000; i++) {
      const rad = 4 + step * a * 7;
      const x = Math.cos(a) * rad;
      const y = Math.sin(a) * rad;
      if (placed.every((p) => Math.hypot(p.x - x, p.y - y) >= p.r + c.r + 3)) {
        spot = { x, y };
        break;
      }
      a += step;
    }
    placed.push({ ...c, ...spot });
  }
  return placed;
}

/** Truncate a label so it fits inside its bubble. */
function fit(name: string, r: number, fontSize: number): string {
  const maxChars = Math.max(2, Math.floor((r * 1.7) / (fontSize * 0.6)));
  return name.length > maxChars ? name.slice(0, maxChars - 1) + "…" : name;
}
