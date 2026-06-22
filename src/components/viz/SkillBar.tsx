import type { Skill } from "@/lib/schema/resume";

/** Horizontal proficiency bars (Tableau-style) for a list of skills. */
export function SkillBars({
  skills,
  color = "#1f77b4",
}: {
  skills: Skill[];
  color?: string;
}) {
  if (skills.length === 0) return null;
  return (
    <div className="flex flex-col gap-3">
      {skills.map((s, i) => (
        <div key={`${s.name}-${i}`} className="flex flex-col gap-1">
          <div className="flex justify-between text-[13px] font-medium text-tab-ink">
            <span>{s.name}</span>
            <span className="tabular-nums text-tab-slate">{Math.round(s.level)}</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-black/10">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${Math.max(4, Math.min(100, s.level))}%`, background: color }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
