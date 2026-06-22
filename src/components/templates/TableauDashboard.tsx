import { GanttTimeline } from "@/components/viz/GanttTimeline";
import { PackedBubbles } from "@/components/viz/PackedBubbles";
import { SkillDotMatrix } from "@/components/viz/SkillDotMatrix";
import { StatCards } from "@/components/viz/StatCard";
import { SERIES } from "@/components/viz/palette";
import { t, type TemplateProps } from "@/components/templates/types";

const SOFT_STATS = ["#4FB0A5", "#E8A33D", "#7E9BD0", "#D9685B"];

/**
 * Tableau-style dashboard resume — the flagship template. Mirrors public
 * Tableau resumes: a header band, a Gantt career timeline, a packed-bubble
 * experience chart and a dot-matrix proficiency panel, with centered section
 * titles. Data-dense but highly scannable.
 */
export function TableauDashboard({ data }: TemplateProps) {
  const lang = data.meta.language;
  const tr = t(lang);
  const { basics } = data;
  const recent = data.work.find((w) => w.highlights.length > 0);

  return (
    <div className="bg-white text-tab-ink">
      {/* Header band */}
      <header className="flex items-center gap-5 bg-[#2c3e50] px-9 py-7 text-white">
        <div
          className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full text-2xl font-bold"
          style={{ background: "#4FB0A5" }}
        >
          {initials(basics.name)}
        </div>
        <div className="min-w-0">
          <h1 className="text-3xl font-bold leading-tight">{basics.name || "Your Name"}</h1>
          <p className="mt-0.5 text-base font-medium text-white/80">{basics.label}</p>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-0.5 text-[12px] text-white/70">
            {basics.email && <span>✉ {basics.email}</span>}
            {basics.phone && <span>☎ {basics.phone}</span>}
            {basics.location.city && <span>📍 {basics.location.city}</span>}
            {basics.url && <span>🔗 {basics.url}</span>}
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-7 px-9 py-7">
        {basics.summary && (
          <p className="mx-auto max-w-3xl text-center text-[13.5px] leading-relaxed text-tab-slate">
            {basics.summary}
          </p>
        )}

        {data.stats.length > 0 && <StatCards stats={data.stats} colors={SOFT_STATS} />}

        {(data.work.length > 0 || data.education.length > 0) && (
          <Panel title={tr("timeline")}>
            <GanttTimeline work={data.work} education={data.education} lang={lang} />
          </Panel>
        )}

        <div className="grid grid-cols-1 gap-7 md:grid-cols-2">
          {data.skills.length >= 2 && (
            <Panel title={tr("usage")}>
              <div className="flex justify-center">
                <PackedBubbles skills={data.skills} />
              </div>
            </Panel>
          )}
          {data.skills.length > 0 && (
            <Panel title={tr("proficiency")}>
              <SkillDotMatrix skills={data.skills} lang={lang} />
            </Panel>
          )}
        </div>

        {recent && (
          <Panel title={tr("highlights")}>
            <div className="mx-auto max-w-3xl">
              <div className="mb-1 text-center text-[13px] font-semibold text-tab-ink">
                {[recent.position, recent.company].filter(Boolean).join(" · ")}
              </div>
              <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                {recent.highlights.slice(0, 4).map((h, i) => (
                  <li
                    key={i}
                    className="rounded-lg bg-tab-panel px-3 py-2 text-[12.5px] leading-snug text-tab-slate"
                  >
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          </Panel>
        )}
      </div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-3 flex flex-col items-center">
        <h3 className="text-[15px] font-semibold tracking-wide text-[#3a4654]">{title}</h3>
        <span className="mt-1 h-0.5 w-8 rounded" style={{ background: SERIES[0] }} />
      </div>
      {children}
    </section>
  );
}

function initials(name: string): string {
  if (!name) return "?";
  const cjk = name.match(/[一-龥]/g);
  if (cjk) return name.slice(-2);
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}
