import { GanttTimeline } from "@/components/viz/GanttTimeline";
import { PackedBubbles } from "@/components/viz/PackedBubbles";
import { SkillDotMatrix } from "@/components/viz/SkillDotMatrix";
import { StatCards } from "@/components/viz/StatCard";
import { SERIES } from "@/components/viz/palette";
import { t, type TemplateProps } from "@/components/templates/types";

const SOFT_STATS = ["#4FB0A5", "#E8A33D", "#7E9BD0", "#D9685B"];
const SIDEBAR = "#2c3e50";
const SIDEBAR_ACCENT = "#6BD0C0";

/**
 * Flagship template — a full-bleed two-column Tableau dashboard resume
 * (à la public Tableau resumes): a readable bio sidebar on the left and a wide
 * data panel on the right with KPI cards, a Gantt career timeline, a
 * packed-bubble experience chart and a dot-matrix proficiency panel.
 */
export function TableauDashboard({ data }: TemplateProps) {
  const lang = data.meta.language;
  const tr = t(lang);
  const { basics } = data;
  const recent = data.work.find((w) => w.highlights.length > 0);

  return (
    <div className="grid grid-cols-[300px_1fr] bg-white text-tab-ink">
      {/* ---------- Left sidebar (bio) ---------- */}
      <aside className="flex flex-col gap-6 px-6 py-7 text-white" style={{ background: SIDEBAR }}>
        <div>
          <div
            className="mb-4 flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold text-white"
            style={{ background: SIDEBAR_ACCENT, color: SIDEBAR }}
          >
            {initials(basics.name)}
          </div>
          <h1 className="text-2xl font-bold leading-tight">{basics.name || "Your Name"}</h1>
          <p className="mt-1 text-sm font-medium" style={{ color: SIDEBAR_ACCENT }}>
            {basics.label}
          </p>
        </div>

        <SideSection title={tr("contact")}>
          <ul className="space-y-1.5 text-[12.5px] text-white/85">
            {basics.email && <li className="break-all">✉ {basics.email}</li>}
            {basics.phone && <li>☎ {basics.phone}</li>}
            {basics.location.city && <li>📍 {basics.location.city}</li>}
            {basics.url && <li className="break-all">🔗 {basics.url}</li>}
            {basics.profiles.map((p, i) => (
              <li key={i} className="break-all">
                {p.network}: {p.username || p.url}
              </li>
            ))}
          </ul>
        </SideSection>

        {basics.summary && (
          <SideSection title={tr("summary")}>
            <p className="text-[12.5px] leading-relaxed text-white/85">{basics.summary}</p>
          </SideSection>
        )}

        {data.education.length > 0 && (
          <SideSection title={tr("education")}>
            <ul className="space-y-3 text-[12.5px]">
              {data.education.map((e, i) => (
                <li key={i}>
                  <div className="font-semibold text-white">{e.institution}</div>
                  <div className="text-white/75">
                    {[e.studyType, e.area].filter(Boolean).join(" · ")}
                  </div>
                  <div className="text-white/55">
                    {[e.startDate, e.endDate].filter(Boolean).join(" – ")}
                  </div>
                </li>
              ))}
            </ul>
          </SideSection>
        )}

        {data.languages.length > 0 && (
          <SideSection title={tr("languages")}>
            <ul className="space-y-1 text-[12.5px] text-white/85">
              {data.languages.map((l, i) => (
                <li key={i}>
                  {l.language}
                  {l.fluency ? ` — ${l.fluency}` : ""}
                </li>
              ))}
            </ul>
          </SideSection>
        )}
      </aside>

      {/* ---------- Right main (data panels) ---------- */}
      <main className="flex flex-col gap-7 px-7 py-7">
        {data.stats.length > 0 && <StatCards stats={data.stats} colors={SOFT_STATS} />}

        {(data.work.length > 0 || data.education.length > 0) && (
          <Panel title={tr("timeline")}>
            <GanttTimeline work={data.work} education={data.education} lang={lang} />
          </Panel>
        )}

        <div className="grid grid-cols-1 gap-7 lg:grid-cols-2">
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
            <div className="mb-1 text-[13px] font-semibold text-tab-ink">
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
          </Panel>
        )}
      </main>
    </div>
  );
}

function SideSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3
        className="mb-2 text-xs font-bold uppercase tracking-wider"
        style={{ color: SIDEBAR_ACCENT }}
      >
        {title}
      </h3>
      {children}
    </section>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <span className="h-4 w-1.5 rounded" style={{ background: SERIES[0] }} />
        <h3 className="text-[15px] font-semibold tracking-wide text-[#3a4654]">{title}</h3>
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
