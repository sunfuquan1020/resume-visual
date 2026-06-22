import { SkillRadar } from "@/components/viz/SkillRadar";
import { SkillBars } from "@/components/viz/SkillBar";
import { Timeline } from "@/components/viz/Timeline";
import { t, type TemplateProps } from "@/components/templates/types";

const ACCENT = "#17becf";

/** Dark bento-grid layout — modern, high-contrast cards. */
export function DarkBento({ data }: TemplateProps) {
  const lang = data.meta.language;
  const tr = t(lang);
  const { basics } = data;

  return (
    <div className="bg-[#11131c] p-7 text-slate-100">
      <div className="grid grid-cols-3 gap-4">
        {/* Header card */}
        <div className="col-span-3 rounded-2xl bg-[#1b1f2e] p-6">
          <h1 className="text-3xl font-bold">{basics.name || "Your Name"}</h1>
          <p className="mt-1 text-base font-medium" style={{ color: ACCENT }}>
            {basics.label}
          </p>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[12.5px] text-slate-400">
            {basics.email && <span>✉ {basics.email}</span>}
            {basics.phone && <span>☎ {basics.phone}</span>}
            {basics.location.city && <span>📍 {basics.location.city}</span>}
            {basics.url && <span>🔗 {basics.url}</span>}
          </div>
        </div>

        {/* Stats */}
        {data.stats.map((s, i) => (
          <div key={i} className="rounded-2xl bg-[#1b1f2e] p-5">
            <div className="text-3xl font-bold tabular-nums" style={{ color: ACCENT }}>
              {s.value}
            </div>
            <div className="mt-1 text-[11px] uppercase tracking-wide text-slate-400">
              {s.label}
            </div>
          </div>
        ))}

        {/* Radar */}
        {data.skills.length >= 3 && (
          <div className="row-span-2 rounded-2xl bg-[#1b1f2e] p-5">
            <CardTitle>{tr("skills")}</CardTitle>
            <SkillRadar skills={data.skills} color={ACCENT} />
          </div>
        )}

        {/* Skill bars */}
        {data.skills.length > 0 && (
          <div className="col-span-2 rounded-2xl bg-[#1b1f2e] p-5">
            <CardTitle>{tr("skills")}</CardTitle>
            <SkillBars skills={data.skills.slice(0, 6)} color={ACCENT} />
          </div>
        )}

        {/* Summary */}
        {basics.summary && (
          <div className="col-span-2 rounded-2xl bg-[#1b1f2e] p-5">
            <CardTitle>{tr("summary")}</CardTitle>
            <p className="text-[13px] leading-relaxed text-slate-300">{basics.summary}</p>
          </div>
        )}

        {/* Experience */}
        {data.work.length > 0 && (
          <div className="col-span-2 rounded-2xl bg-[#1b1f2e] p-5">
            <CardTitle>{tr("experience")}</CardTitle>
            <div className="[&_*]:!text-slate-300 [&_h4]:!text-white">
              <Timeline work={data.work} color={ACCENT} presentLabel={tr("present")} />
            </div>
          </div>
        )}

        {/* Education */}
        {data.education.length > 0 && (
          <div className="rounded-2xl bg-[#1b1f2e] p-5">
            <CardTitle>{tr("education")}</CardTitle>
            <ul className="space-y-3 text-[12.5px]">
              {data.education.map((e, i) => (
                <li key={i}>
                  <div className="font-semibold text-white">{e.institution}</div>
                  <div className="text-slate-400">
                    {[e.studyType, e.area].filter(Boolean).join(" · ")}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function CardTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">{children}</h3>
  );
}
