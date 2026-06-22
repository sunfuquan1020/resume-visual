import type { Stat } from "@/lib/schema/resume";

/** Big-number KPI cards, like the headline tiles in the Tableau resume. */
export function StatCards({
  stats,
  colors = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728"],
}: {
  stats: Stat[];
  colors?: string[];
}) {
  if (stats.length === 0) return null;
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((s, i) => (
        <div
          key={i}
          className="rounded-xl px-3 py-3 text-white shadow-sm"
          style={{ background: colors[i % colors.length] }}
        >
          <div className="text-2xl font-bold leading-none tabular-nums">{s.value}</div>
          <div className="mt-1 text-[11px] font-medium uppercase tracking-wide opacity-90">
            {s.label}
          </div>
        </div>
      ))}
    </div>
  );
}
