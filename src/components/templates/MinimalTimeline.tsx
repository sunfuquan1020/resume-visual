import { SkillBars } from "@/components/viz/SkillBar";
import { Timeline } from "@/components/viz/Timeline";
import { t, type TemplateProps } from "@/components/templates/types";

const ACCENT = "#2ca02c";

/** Clean single-column resume — light, print-friendly, accent-green. */
export function MinimalTimeline({ data }: TemplateProps) {
  const lang = data.meta.language;
  const tr = t(lang);
  const { basics } = data;

  return (
    <div className="bg-white p-10 text-tab-ink">
      <header className="border-b-2 pb-4" style={{ borderColor: ACCENT }}>
        <h1 className="text-3xl font-bold">{basics.name || "Your Name"}</h1>
        <p className="mt-1 text-base font-medium" style={{ color: ACCENT }}>
          {basics.label}
        </p>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[12.5px] text-tab-slate">
          {basics.email && <span>✉ {basics.email}</span>}
          {basics.phone && <span>☎ {basics.phone}</span>}
          {basics.location.city && <span>📍 {basics.location.city}</span>}
          {basics.url && <span>🔗 {basics.url}</span>}
        </div>
      </header>

      {basics.summary && (
        <p className="mt-5 text-[13.5px] leading-relaxed text-tab-slate">{basics.summary}</p>
      )}

      <div className="mt-6 grid grid-cols-[1fr_240px] gap-8">
        <div>
          <H title={tr("experience")} />
          <Timeline work={data.work} color={ACCENT} presentLabel={tr("present")} />

          {data.education.length > 0 && (
            <>
              <H title={tr("education")} className="mt-6" />
              <ul className="space-y-2 text-[13px]">
                {data.education.map((e, i) => (
                  <li key={i} className="flex justify-between gap-3">
                    <span>
                      <span className="font-semibold">{e.institution}</span>{" "}
                      <span className="text-tab-slate">
                        {[e.studyType, e.area].filter(Boolean).join(" · ")}
                      </span>
                    </span>
                    <span className="shrink-0 text-tab-slate">
                      {[e.startDate, e.endDate].filter(Boolean).join(" – ")}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        <aside>
          {data.skills.length > 0 && (
            <>
              <H title={tr("skills")} />
              <SkillBars skills={data.skills.slice(0, 10)} color={ACCENT} />
            </>
          )}
        </aside>
      </div>
    </div>
  );
}

function H({ title, className = "" }: { title: string; className?: string }) {
  return (
    <h3
      className={`mb-3 text-sm font-bold uppercase tracking-wider ${className}`}
      style={{ color: ACCENT }}
    >
      {title}
    </h3>
  );
}
