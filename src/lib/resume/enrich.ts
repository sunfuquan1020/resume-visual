import type { ResumeData, Stat, Work } from "@/lib/schema/resume";

/**
 * Provider-agnostic post-processing. LLMs sometimes omit the headline `stats`
 * cards or the `label`; this fills sensible defaults so every template renders
 * fully regardless of which provider produced the data.
 */
export function enrichResume(data: ResumeData): ResumeData {
  let out = data;

  // Fall back to the most-recent position as the headline.
  if (!out.basics.label && out.work[0]?.position) {
    out = { ...out, basics: { ...out.basics, label: out.work[0].position } };
  }

  // Generate KPI cards if the model didn't.
  if (out.stats.length === 0) {
    out = { ...out, stats: buildDefaultStats(out) };
  }

  return out;
}

/**
 * Safety net for translation: LLMs occasionally drop optional array items.
 * If a translated array has fewer entries than the source, append the missing
 * source items (untranslated) so no section is ever lost.
 */
export function reconcileVariant(translated: ResumeData, source: ResumeData): ResumeData {
  const fill = <T>(t: T[], s: T[]): T[] => (t.length >= s.length ? t : [...t, ...s.slice(t.length)]);
  return {
    ...translated,
    work: fill(translated.work, source.work),
    education: fill(translated.education, source.education),
    skills: fill(translated.skills, source.skills),
    projects: fill(translated.projects, source.projects),
  };
}

export function buildDefaultStats(data: ResumeData): Stat[] {
  const zh = data.meta.language === "zh";
  const years = estimateYears(data.work);
  return [
    { label: zh ? "工作年限" : "Years Experience", value: years ? `${years}+` : "—" },
    { label: zh ? "任职公司" : "Companies", value: String(data.work.length || "—") },
    { label: zh ? "核心技能" : "Core Skills", value: String(data.skills.length || "—") },
  ];
}

/** Estimate total years of experience from the span of work dates. */
export function estimateYears(work: Work[]): number {
  const years = work
    .flatMap((w) => [w.startDate, w.endDate])
    .map((d) => Number((d || "").match(/(19|20)\d{2}/)?.[0]))
    .filter((n) => !Number.isNaN(n));
  if (years.length < 1) return 0;
  const min = Math.min(...years);
  const max = Math.max(new Date().getFullYear(), ...years);
  return Math.max(0, max - min);
}
