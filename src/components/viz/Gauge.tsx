/** Simple donut gauge for a single 0-100 value (e.g. language fluency). */
export function Gauge({
  value,
  label,
  size = 92,
  color = "#2ca02c",
}: {
  value: number;
  label: string;
  size?: number;
  color?: string;
}) {
  const stroke = 9;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  const dash = (pct / 100) * c;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#00000012" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={16}
          fontWeight={700}
          fill="#1a1a2e"
        >
          {Math.round(pct)}
        </text>
      </svg>
      <span className="text-center text-[11px] font-medium text-tab-slate">{label}</span>
    </div>
  );
}
