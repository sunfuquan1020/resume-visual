import type { Skill } from "@/lib/schema/resume";

const TIER_LABELS = {
  zh: ["入门", "中级", "熟练", "精通"],
  en: ["Beginner", "Intermediate", "Advanced", "Expert"],
};

/**
 * Dot-matrix skill proficiency: each skill is a row; filled dots up to its
 * level across four graded columns. Reads at a glance and prints cleanly —
 * the "技能水平" panel from the reference resumes.
 */
export function SkillDotMatrix({
  skills,
  lang,
  color = "#E8A33D",
}: {
  skills: Skill[];
  lang: "zh" | "en";
  color?: string;
}) {
  const data = skills.slice(0, 10);
  if (data.length === 0) return null;
  const tiers = TIER_LABELS[lang];

  return (
    <div className="w-full">
      {/* Column headers */}
      <div className="mb-2 grid grid-cols-[1fr_repeat(4,minmax(0,1fr))] items-end gap-1">
        <span />
        {tiers.map((t) => (
          <span key={t} className="text-center text-[10.5px] font-medium leading-tight text-tab-slate">
            {t}
          </span>
        ))}
      </div>

      <div className="flex flex-col gap-1.5">
        {data.map((s, i) => {
          const filled = Math.max(1, Math.min(4, Math.ceil(s.level / 25)));
          return (
            <div
              key={`${s.name}-${i}`}
              className="grid grid-cols-[1fr_repeat(4,minmax(0,1fr))] items-center gap-1"
            >
              <span className="truncate pr-2 text-[12.5px] font-medium text-tab-ink">{s.name}</span>
              {[1, 2, 3, 4].map((tier) => (
                <span key={tier} className="flex justify-center">
                  <span
                    className="h-3.5 w-3.5 rounded-full border-2"
                    style={
                      tier <= filled
                        ? { background: color, borderColor: color }
                        : { background: "transparent", borderColor: "#d4d9e0" }
                    }
                  />
                </span>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
