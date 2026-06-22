import type { Work } from "@/lib/schema/resume";

/** Vertical career timeline with connector line and dots. */
export function Timeline({
  work,
  color = "#ff7f0e",
  presentLabel = "Present",
}: {
  work: Work[];
  color?: string;
  presentLabel?: string;
}) {
  if (work.length === 0) return null;
  return (
    <ol className="relative ml-2 border-l-2" style={{ borderColor: `${color}66` }}>
      {work.map((w, i) => (
        <li key={i} className="relative mb-5 pl-5 last:mb-0">
          <span
            className="absolute -left-[7px] top-1 h-3 w-3 rounded-full ring-2 ring-white"
            style={{ background: color }}
          />
          <div className="flex flex-wrap items-baseline justify-between gap-x-2">
            <h4 className="text-[15px] font-semibold text-tab-ink">{w.position || w.company}</h4>
            <span className="text-xs font-medium tabular-nums text-tab-slate">
              {w.startDate}
              {w.startDate || w.endDate ? " – " : ""}
              {w.endDate || (w.startDate ? presentLabel : "")}
            </span>
          </div>
          {w.company && w.position && (
            <div className="text-[13px] font-medium text-tab-blue">{w.company}</div>
          )}
          {w.summary && <p className="mt-1 text-[13px] text-tab-slate">{w.summary}</p>}
          {w.highlights.length > 0 && (
            <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[12.5px] text-tab-slate">
              {w.highlights.slice(0, 4).map((h, j) => (
                <li key={j}>{h}</li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ol>
  );
}
