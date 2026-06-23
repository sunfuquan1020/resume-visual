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

/**
 * Rule shared by extraction and translation: keep each rendered resume in ONE
 * language, but never translate technical terms or brand names.
 */
const NO_MIX_RULE = [
  "CRITICAL — single language, no mixing: every human-readable field must be written in ONE language only.",
  "Do NOT append parenthetical translations. Write '苏万清', not '苏万清 (Nicole Su)'. Write 'CRM 高级运营专员', not 'CRM 高级运营专员 (Senior CRM Operations Specialist)'.",
  "EXCEPTION — keep these in their original Latin/English form in every language: software, tools, frameworks, libraries, programming languages, and well-known company brand names (e.g. Salesforce, Power BI, Python, SQL, OLYMPUS).",
].join("\n");

export function buildSystemPrompt(language: "zh" | "en" | "auto"): string {
  const langLine =
    language === "auto"
      ? "Detect the resume's primary language and set meta.language to 'zh' or 'en'. Write all text in that single detected language."
      : `Write the resume entirely in ${language === "zh" ? "Chinese" : "English"}. Set meta.language to '${language}'.`;

  return [
    "You are an expert resume parser that converts raw resume text into a structured JSON object for an infographic resume builder.",
    "Extract ALL relevant information accurately. Do not invent facts that are not present.",
    langLine,
    NO_MIX_RULE,
    "For skills[].level, infer a 0-100 proficiency from seniority, recency, and how prominently the skill is featured (most should fall in 50-95).",
    "Produce 3-4 stats cards that best summarize the candidate at a glance (years of experience, number of companies/projects, key metric, etc.).",
    "Return ONLY a JSON object that matches the provided schema. No prose, no markdown fences.",
  ].join("\n");
}

/** System prompt for translating an already-structured ResumeData JSON. */
export function buildTranslateSystemPrompt(target: "zh" | "en"): string {
  const lang = target === "zh" ? "Chinese (Simplified)" : "English";
  return [
    `You are a professional resume translator. Translate the given resume JSON into ${lang}.`,
    "Keep the EXACT same JSON structure and all numeric/date values (skills[].level, dates) unchanged.",
    "PRESERVE EVERY ITEM: each output array (work, education, skills, projects, stats) MUST contain the SAME number of entries as the input. Translate each entry; never drop, merge, or skip one.",
    "Translate every human-readable text field: name, label, summary, company, position, institution, area, highlights, project text, and stat labels.",
    "For a person's name, use the natural form in the target language if present in the source, otherwise transliterate.",
    NO_MIX_RULE,
    `Set meta.language to '${target}'.`,
    "Return ONLY the translated JSON object. No prose, no markdown fences.",
  ].join("\n");
}

export function buildUserPrompt(resumeText: string): string {
  return `Resume text:\n"""\n${resumeText.slice(0, 24000)}\n"""`;
}

export function buildTranslateUserPrompt(resumeJson: string): string {
  return `Resume JSON to translate:\n${resumeJson.slice(0, 24000)}`;
}

/** Schema for the resume-editing assistant: a chat reply + the full updated resume. */
export const CHAT_SCHEMA = {
  type: "object",
  properties: {
    reply: {
      type: "string",
      description:
        "A short, friendly reply to the user describing what you changed or suggesting next steps. Same language as the resume.",
    },
    resume: RESUME_JSON_SCHEMA,
  },
  required: ["reply", "resume"],
} as const;

export type ChatTurn = { role: "user" | "assistant"; content: string };

export function buildChatSystemPrompt(language: "zh" | "en"): string {
  return [
    "You are a resume-editing assistant inside an infographic resume builder.",
    "You receive the user's CURRENT resume as JSON plus a conversation. Apply the user's requested edits and return the FULL updated resume JSON, together with a short reply.",
    "Only change what the user asks for; preserve everything else exactly. Never invent experience, employers, or credentials the user didn't provide.",
    "You may improve wording, tighten the summary, rebalance skill levels (0-100), or add/adjust stats when asked.",
    NO_MIX_RULE,
    `Reply in ${language === "zh" ? "Chinese" : "English"}; keep meta.language = '${language}'.`,
    "Return ONLY the JSON object {reply, resume}. No prose, no markdown fences.",
  ].join("\n");
}

export function buildChatUserPrompt(resumeJson: string, history: ChatTurn[]): string {
  const convo = history
    .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
    .join("\n");
  return `Current resume JSON:\n${resumeJson.slice(0, 20000)}\n\nConversation:\n${convo}`;
}
