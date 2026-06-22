import type { Skill } from "@/lib/schema/resume";

/** Hand-rolled SVG radar chart for up to ~8 skills. */
export function SkillRadar({
  skills,
  size = 240,
  color = "#1f77b4",
}: {
  skills: Skill[];
  size?: number;
  color?: string;
}) {
  const data = skills.slice(0, 8);
  if (data.length < 3) return null;

  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 36;
  const n = data.length;
  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const point = (i: number, frac: number) => {
    const a = angle(i);
    return [cx + Math.cos(a) * r * frac, cy + Math.sin(a) * r * frac] as const;
  };

  const rings = [0.25, 0.5, 0.75, 1];
  const polygon = data
    .map((s, i) => point(i, Math.max(0.05, Math.min(1, s.level / 100))).join(","))
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      style={{ width: "100%", height: "auto" }}
      role="img"
      aria-label="Skill radar"
    >
      {rings.map((ring) => (
        <polygon
          key={ring}
          points={data.map((_, i) => point(i, ring).join(",")).join(" ")}
          fill="none"
          stroke="#00000018"
        />
      ))}
      {data.map((_, i) => {
        const [x, y] = point(i, 1);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#00000018" />;
      })}
      <polygon points={polygon} fill={`${color}33`} stroke={color} strokeWidth={2} />
      {data.map((s, i) => {
        const [lx, ly] = point(i, 1.16);
        return (
          <text
            key={i}
            x={lx}
            y={ly}
            fontSize={10}
            fill="#4a5568"
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {s.name.length > 10 ? s.name.slice(0, 9) + "…" : s.name}
          </text>
        );
      })}
    </svg>
  );
}
