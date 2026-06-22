import type { Education, Work } from "@/lib/schema/resume";
import { CATEGORY_COLORS, parseYear } from "@/components/viz/palette";

type Category = "education" | "internship" | "work";

interface Bar {
  category: Category;
  title: string;
  sub: string;
  start: number;
  end: number;
  present: boolean;
}

const CATEGORY_LABEL: Record<Category, { zh: string; en: string }> = {
  education: { zh: "教育", en: "Education" },
  internship: { zh: "实习", en: "Internship" },
  work: { zh: "工作", en: "Work" },
};

/**
 * Gantt-style career timeline: one colored bar per role/degree on a shared
 * year axis, grouped and colored by category — the signature panel of a
 * Tableau resume. Far more scannable than a vertical list.
 */
export function GanttTimeline({
  work,
  education,
  lang,
}: {
  work: Work[];
  education: Education[];
  lang: "zh" | "en";
}) {
  const bars = buildBars(work, education);
  if (bars.length === 0) return null;

  const currentYear = new Date().getFullYear();
  const minYear = Math.min(...bars.map((b) => b.start));
  const maxYear = Math.max(currentYear, ...bars.map((b) => b.end));

  // Layout constants.
  const W = 780;
  const labelW = 250;
  const padR = 24;
  const plotX = labelW;
  const plotW = W - labelW - padR;
  const topAxis = 26;
  const rowH = 34;
  const H = topAxis + bars.length * rowH + 10;

  const span = Math.max(1, maxYear - minYear);
  const xs = (year: number) => plotX + ((year - minYear) / span) * plotW;

  // One tick per year, but thin out if the span is wide.
  const step = span > 10 ? 2 : 1;
  const ticks: number[] = [];
  for (let y = minYear; y <= maxYear; y += step) ticks.push(y);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto" }} role="img" aria-label="Career timeline">
      {/* Year gridlines + labels */}
      {ticks.map((y) => (
        <g key={y}>
          <line x1={xs(y)} y1={topAxis} x2={xs(y)} y2={H - 6} stroke="#00000010" />
          <text x={xs(y)} y={16} fontSize={11} fill="#8a93a0" textAnchor="middle">
            {lang === "zh" ? `${y}年` : y}
          </text>
        </g>
      ))}

      {bars.map((b, i) => {
        const cy = topAxis + i * rowH + rowH / 2;
        const x1 = xs(b.start);
        const x2 = Math.max(xs(b.end), x1 + 10);
        const color = CATEGORY_COLORS[b.category];
        return (
          <g key={i}>
            {/* Left labels: category chip + title + sub */}
            <rect x={0} y={cy - 7} width={10} height={14} rx={2} fill={color} />
            <text x={18} y={cy - 1} fontSize={12.5} fontWeight={600} fill="#2c3440">
              {b.title}
            </text>
            <text x={18} y={cy + 12} fontSize={11} fill="#8a93a0">
              {b.sub}
            </text>

            {/* Bar */}
            <rect x={x1} y={cy - 6} width={x2 - x1} height={12} rx={6} fill={color} />
            {b.present && (
              <polygon
                points={`${x2},${cy - 7} ${x2 + 9},${cy} ${x2},${cy + 7}`}
                fill={color}
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}

function buildBars(work: Work[], education: Education[]): Bar[] {
  const eduBars: Bar[] = education.map((e) => ({
    category: "education" as const,
    title: e.institution,
    sub: [e.studyType, e.area].filter(Boolean).join(" · "),
    ...span(e.startDate, e.endDate),
  }));

  const workBars: Bar[] = work.map((w) => ({
    category: /实习|intern/i.test(w.position) ? ("internship" as const) : ("work" as const),
    title: w.company,
    sub: w.position,
    ...span(w.startDate, w.endDate),
  }));

  const order: Record<Category, number> = { education: 0, internship: 1, work: 2 };
  return [...eduBars, ...workBars]
    .filter((b) => b.title) // need at least a name
    .sort((a, b) => order[a.category] - order[b.category] || a.start - b.start);
}

function span(startDate: string, endDate: string): { start: number; end: number; present: boolean } {
  const currentYear = new Date().getFullYear();
  const start = parseYear(startDate) ?? currentYear;
  const parsedEnd = parseYear(endDate);
  const present = !parsedEnd;
  return { start, end: parsedEnd ?? currentYear, present };
}

export { CATEGORY_LABEL };
