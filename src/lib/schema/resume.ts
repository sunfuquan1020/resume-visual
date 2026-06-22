import { z } from "zod";

/**
 * ResumeData — the single data contract for the whole app.
 * Based on the JSON Resume schema (https://jsonresume.org/schema) with
 * visualization-friendly extensions:
 *   - skills[].level   numeric proficiency (0-100) → bars / radar
 *   - stats            KPI cards (years of experience, projects, etc.)
 *   - meta.language    'zh' | 'en' for fonts / template copy
 *
 * Every template renders from this contract only — data/presentation are
 * kept separate, so adding a template never touches extraction logic.
 */

export const LocationSchema = z.object({
  city: z.string().default(""),
  region: z.string().default(""),
  country: z.string().default(""),
});

export const ProfileSchema = z.object({
  network: z.string().default(""), // GitHub, LinkedIn, WeChat...
  username: z.string().default(""),
  url: z.string().default(""),
});

export const BasicsSchema = z.object({
  name: z.string().default(""),
  label: z.string().default(""), // headline / current title
  email: z.string().default(""),
  phone: z.string().default(""),
  url: z.string().default(""),
  summary: z.string().default(""),
  location: LocationSchema.prefault({}),
  profiles: z.array(ProfileSchema).default([]),
});

export const WorkSchema = z.object({
  company: z.string().default(""),
  position: z.string().default(""),
  startDate: z.string().default(""), // free-form (YYYY-MM or text)
  endDate: z.string().default(""), // empty = present
  summary: z.string().default(""),
  highlights: z.array(z.string()).default([]),
});

export const EducationSchema = z.object({
  institution: z.string().default(""),
  area: z.string().default(""), // major
  studyType: z.string().default(""), // degree
  startDate: z.string().default(""),
  endDate: z.string().default(""),
  score: z.string().default(""), // GPA
});

export const SkillSchema = z.object({
  name: z.string().default(""),
  level: z.number().min(0).max(100).default(60),
  category: z.string().default(""),
});

export const ProjectSchema = z.object({
  name: z.string().default(""),
  description: z.string().default(""),
  highlights: z.array(z.string()).default([]),
  url: z.string().default(""),
});

export const StatSchema = z.object({
  label: z.string().default(""), // "Years Experience"
  value: z.string().default(""), // "8+"
});

export const ResumeDataSchema = z.object({
  basics: BasicsSchema.prefault({}),
  work: z.array(WorkSchema).default([]),
  education: z.array(EducationSchema).default([]),
  skills: z.array(SkillSchema).default([]),
  projects: z.array(ProjectSchema).default([]),
  languages: z.array(z.object({ language: z.string(), fluency: z.string() })).default([]),
  stats: z.array(StatSchema).default([]),
  meta: z
    .object({
      language: z.enum(["zh", "en"]).default("en"),
      source: z.string().default(""), // which provider produced this
    })
    .prefault({}),
});

export type Location = z.infer<typeof LocationSchema>;
export type Basics = z.infer<typeof BasicsSchema>;
export type Work = z.infer<typeof WorkSchema>;
export type Education = z.infer<typeof EducationSchema>;
export type Skill = z.infer<typeof SkillSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type Stat = z.infer<typeof StatSchema>;
export type ResumeData = z.infer<typeof ResumeDataSchema>;

/** Parse loosely-typed LLM output into a fully-defaulted ResumeData. */
export function parseResumeData(input: unknown): ResumeData {
  return ResumeDataSchema.parse(input ?? {});
}

/** An empty, valid ResumeData (used as editor seed / fallback). */
export function emptyResume(): ResumeData {
  return ResumeDataSchema.parse({});
}
