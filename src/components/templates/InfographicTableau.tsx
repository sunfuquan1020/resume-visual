import { SkillBars } from "@/components/viz/SkillBar";
import { SkillRadar } from "@/components/viz/SkillRadar";
import { Timeline } from "@/components/viz/Timeline";
import { StatCards } from "@/components/viz/StatCard";
import { t, type TemplateProps } from "@/components/templates/types";

const ACCENT = "#1f77b4";
const SIDEBAR = "#0b3d61";

/**
 * Tableau-style infographic resume: dark profile sidebar + data-dense main
 * column with KPI cards, a skill radar, proficiency bars and a career timeline.
 */
export function InfographicTableau({ data }: TemplateProps) {
  const lang = data.meta.language;
  const tr = t(lang);
  const { basics } = data;

  return (
    <div className="grid grid-cols-[34%_1fr] overflow-hidden bg-white text-tab-ink">
      {/* Sidebar */}
      <aside className="flex flex-col gap-6 p-7 text-white" style={{ background: SIDEBAR }}>
        <div>
          <div
            className="mb-4 flex h-24 w-24 items-center justify-center rounded-full text-3xl font-bold"
            style={{ background: ACCENT }}
          >
            {initials(basics.name)}
          </div>
          <h1 className="text-2xl font-bold leading-tight">{basics.name || "Your Name"}</h1>
          <p className="mt-1 text-sm font-medium text-white/80">{basics.label}</p>
        </div>

        <Section title={tr("contact")} light>
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
        </Section>

        {data.skills.length >= 3 && (
          <Section title={tr("skills")} light>
            <div className="rounded-lg bg-white/5 p-2">
              <SkillRadar skills={data.skills} color="#7fd0ff" />
            </div>
          </Section>
        )}

        {data.education.length > 0 && (
          <Section title={tr("education")} light>
            <ul className="space-y-3 text-[12.5px]">
              {data.education.map((e, i) => (
                <li key={i}>
                  <div className="font-semibold text-white">{e.institution}</div>
                  <div className="text-white/80">
                    {[e.studyType, e.area].filter(Boolean).join(" · ")}
                  </div>
                  <div className="text-white/60">
                    {[e.startDate, e.endDate].filter(Boolean).join(" – ")}
                  </div>
                </li>
              ))}
            </ul>
          </Section>
        )}
      </aside>

      {/* Main */}
      <main className="flex flex-col gap-6 p-8">
        {data.stats.length > 0 && <StatCards stats={data.stats} />}

        {basics.summary && (
          <Section title={tr("summary")}>
            <p className="text-[13.5px] leading-relaxed text-tab-slate">{basics.summary}</p>
          </Section>
        )}

        {data.skills.length > 0 && (
          <Section title={tr("skills")}>
            <SkillBars skills={data.skills.slice(0, 8)} color={ACCENT} />
          </Section>
        )}

        {data.work.length > 0 && (
          <Section title={tr("experience")}>
            <Timeline work={data.work} color="#ff7f0e" presentLabel={tr("present")} />
          </Section>
        )}

        {data.projects.length > 0 && (
          <Section title={tr("projects")}>
            <ul className="space-y-2">
              {data.projects.map((p, i) => (
                <li key={i}>
                  <div className="text-[14px] font-semibold">{p.name}</div>
                  {p.description && (
                    <p className="text-[13px] text-tab-slate">{p.description}</p>
                  )}
                </li>
              ))}
            </ul>
          </Section>
        )}
      </main>
    </div>
  );
}

function Section({
  title,
  children,
  light,
}: {
  title: string;
  children: React.ReactNode;
  light?: boolean;
}) {
  return (
    <section>
      <h3
        className={`mb-2 text-xs font-bold uppercase tracking-wider ${
          light ? "text-white/70" : "text-tab-blue"
        }`}
      >
        {title}
      </h3>
      {!light && <div className="mb-3 h-0.5 w-10 rounded bg-tab-orange" />}
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
