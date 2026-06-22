/**
 * Shared prompt + JSON schema used by every provider so extraction output is
 * provider-agnostic and validates against the same ResumeData contract.
 */

export const RESUME_JSON_SCHEMA = {
  type: "object",
  properties: {
    basics: {
      type: "object",
      properties: {
        name: { type: "string" },
        label: { type: "string", description: "Professional headline / current title" },
        email: { type: "string" },
        phone: { type: "string" },
        url: { type: "string" },
        summary: { type: "string" },
        location: {
          type: "object",
          properties: {
            city: { type: "string" },
            region: { type: "string" },
            country: { type: "string" },
          },
        },
        profiles: {
          type: "array",
          items: {
            type: "object",
            properties: {
              network: { type: "string" },
              username: { type: "string" },
              url: { type: "string" },
            },
          },
        },
      },
    },
    work: {
      type: "array",
      items: {
        type: "object",
        properties: {
          company: { type: "string" },
          position: { type: "string" },
          startDate: { type: "string" },
          endDate: { type: "string", description: "Empty string if current" },
          summary: { type: "string" },
          highlights: { type: "array", items: { type: "string" } },
        },
      },
    },
    education: {
      type: "array",
      items: {
        type: "object",
        properties: {
          institution: { type: "string" },
          area: { type: "string" },
          studyType: { type: "string" },
          startDate: { type: "string" },
          endDate: { type: "string" },
          score: { type: "string" },
        },
      },
    },
    skills: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          level: {
            type: "number",
            description:
              "Inferred proficiency 0-100 based on seniority, recency and emphasis. Use 50-95.",
          },
          category: { type: "string" },
        },
      },
    },
    projects: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          description: { type: "string" },
          highlights: { type: "array", items: { type: "string" } },
          url: { type: "string" },
        },
      },
    },
    languages: {
      type: "array",
      items: {
        type: "object",
        properties: { language: { type: "string" }, fluency: { type: "string" } },
      },
    },
    stats: {
      type: "array",
      description:
        "3-4 headline KPI cards summarizing the candidate, e.g. {label:'Years Experience', value:'8+'}.",
      items: {
        type: "object",
        properties: { label: { type: "string" }, value: { type: "string" } },
      },
    },
    meta: {
      type: "object",
      properties: { language: { type: "string", enum: ["zh", "en"] } },
    },
  },
  required: ["basics", "work", "skills"],
} as const;

export function buildSystemPrompt(language: "zh" | "en" | "auto"): string {
  const langLine =
    language === "auto"
      ? "Detect the resume's primary language and set meta.language to 'zh' or 'en'. Keep extracted text in its original language."
      : `The resume language is ${language}. Set meta.language to '${language}'.`;

  return [
    "You are an expert resume parser that converts raw resume text into a structured JSON object for an infographic resume builder.",
    "Extract ALL relevant information accurately. Do not invent facts that are not present.",
    langLine,
    "For skills[].level, infer a 0-100 proficiency from seniority, recency, and how prominently the skill is featured (most should fall in 50-95).",
    "Produce 3-4 stats cards that best summarize the candidate at a glance (years of experience, number of companies/projects, key metric, etc.).",
    "Return ONLY a JSON object that matches the provided schema. No prose, no markdown fences.",
  ].join("\n");
}

export function buildUserPrompt(resumeText: string): string {
  return `Resume text:\n"""\n${resumeText.slice(0, 24000)}\n"""`;
}
