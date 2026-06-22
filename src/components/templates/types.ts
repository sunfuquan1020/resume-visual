import type { ResumeData } from "@/lib/schema/resume";

export interface TemplateProps {
  data: ResumeData;
}

export interface TemplateMeta {
  id: string;
  name: string;
  description: string;
  accent: string;
  Component: React.ComponentType<TemplateProps>;
}

/** Tiny i18n helper so templates can show localized section titles. */
export function t(lang: "zh" | "en") {
  const dict = {
    summary: { zh: "个人简介", en: "Summary" },
    experience: { zh: "工作经历", en: "Experience" },
    skills: { zh: "专业技能", en: "Skills" },
    education: { zh: "教育背景", en: "Education" },
    projects: { zh: "项目经历", en: "Projects" },
    contact: { zh: "联系方式", en: "Contact" },
    present: { zh: "至今", en: "Present" },
    languages: { zh: "语言能力", en: "Languages" },
    timeline: { zh: "时间轴", en: "Timeline" },
    usage: { zh: "技能使用经历", en: "Experience" },
    proficiency: { zh: "技能水平", en: "Proficiency" },
    highlights: { zh: "工作亮点", en: "Highlights" },
  } as const;
  return (key: keyof typeof dict) => dict[key][lang];
}
