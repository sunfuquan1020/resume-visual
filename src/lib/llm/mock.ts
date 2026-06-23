import { parseResumeData, type ResumeData } from "@/lib/schema/resume";
import { buildDefaultStats } from "@/lib/resume/enrich";
import type { ExtractOptions, LLMProvider } from "@/lib/llm/provider";

/**
 * Rule-based fallback extractor. Used when no LLM provider is configured so the
 * app demos end-to-end without any API keys. It is intentionally heuristic —
 * good enough to populate every template section from typical resume text.
 */
export class MockProvider implements LLMProvider {
  readonly id = "mock" as const;

  /**
   * The rule-based extractor can't translate. It just relabels the language so
   * localized section titles switch; narrative content stays as extracted.
   */
  async translateResume(data: ResumeData, target: "zh" | "en"): Promise<ResumeData> {
    return { ...data, meta: { ...data.meta, language: target } };
  }

  /** No LLM behind the rule-based extractor — the assistant needs a real model. */
  async complete(): Promise<unknown> {
    throw new Error(
      "AI 助手需要配置大模型（Claude / OpenAI / OpenRouter / Ollama）。请在 .env.local 设置后重试。",
    );
  }

  async extractResume(text: string, opts: ExtractOptions): Promise<ResumeData> {
    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    const language =
      opts.language === "auto" ? (hasCJK(text) ? "zh" : "en") : opts.language;

    const email = firstMatch(text, /[\w.+-]+@[\w-]+\.[\w.-]+/);
    const phone = firstMatch(
      text,
      /(\+?\d[\d\s().-]{7,}\d)|(1[3-9]\d{9})/,
    )?.replace(/\s{2,}/g, " ");
    const url = firstMatch(text, /https?:\/\/[^\s)]+/);

    const name = lines[0]?.length <= 30 ? lines[0] : guessName(lines);
    const label = pickHeadline(lines, name);

    const skills = extractSkills(text);
    const work = extractWork(lines, language);
    const education = extractEducation(lines, language);
    const summary = pickSummary(lines, name, label);

    const base = parseResumeData({
      basics: {
        name,
        label,
        email: email ?? "",
        phone: phone ?? "",
        url: url ?? "",
        summary,
        location: { city: detectCity(text) },
        profiles: url ? [{ network: "Web", url, username: "" }] : [],
      },
      work,
      education,
      skills,
      meta: { language, source: "mock" },
    });
    return { ...base, stats: buildDefaultStats(base) };
  }
}

function hasCJK(s: string): boolean {
  return /[一-龥]/.test(s);
}

const KNOWN_CITIES = [
  "San Francisco", "New York", "Los Angeles", "Seattle", "Boston", "Chicago",
  "Austin", "London", "Berlin", "Paris", "Toronto", "Singapore", "Tokyo",
  "Beijing", "Shanghai", "Shenzhen", "Guangzhou", "Hangzhou", "Chengdu",
  "北京", "上海", "深圳", "广州", "杭州", "成都", "南京", "武汉", "西安", "苏州",
];

function detectCity(text: string): string {
  for (const c of KNOWN_CITIES) {
    if (text.includes(c)) return c;
  }
  const cn = text.match(/([一-龥]{2,4})市/);
  return cn ? cn[1] : "";
}

function firstMatch(text: string, re: RegExp): string | undefined {
  const m = text.match(re);
  return m ? m[0].trim() : undefined;
}

function guessName(lines: string[]): string {
  const candidate = lines.find((l) => l.length <= 20 && !/[@\d]/.test(l));
  return candidate ?? "Your Name";
}

const HEADLINE_HINTS =
  /(engineer|developer|designer|manager|analyst|scientist|architect|consultant|工程师|经理|设计师|分析师|架构师|开发|总监)/i;

function pickHeadline(lines: string[], name: string): string {
  const line = lines.slice(0, 6).find((l) => l !== name && HEADLINE_HINTS.test(l));
  return line ?? "";
}

const SUMMARY_HEADERS = /(summary|profile|objective|about|个人简介|自我评价|简介)/i;

function pickSummary(lines: string[], name: string, label: string): string {
  const idx = lines.findIndex((l) => SUMMARY_HEADERS.test(l) && l.length < 30);
  if (idx !== -1 && lines[idx + 1]) {
    const out: string[] = [];
    for (const l of lines.slice(idx + 1, idx + 5)) {
      if (isHeader(l) || DATE_RANGE.test(l)) break; // stop at next section
      out.push(l);
    }
    if (out.length) return out.join(" ");
  }
  // Otherwise the longest early paragraph that isn't the name/label.
  return (
    lines
      .slice(0, 12)
      .filter((l) => l !== name && l !== label && l.length > 40)
      .sort((a, b) => b.length - a.length)[0] ?? ""
  );
}

const SKILL_HEADER = /(skills?|technolog|tech stack|技能|专业技能|技术栈)/i;
const COMMON_SKILLS = [
  "JavaScript", "TypeScript", "Python", "Java", "Go", "Rust", "C++", "C#", "SQL",
  "React", "Vue", "Angular", "Node", "Next.js", "Django", "Spring", "Docker",
  "Kubernetes", "AWS", "GCP", "Azure", "PostgreSQL", "MySQL", "MongoDB", "Redis",
  "Git", "GraphQL", "Tableau", "Figma", "Excel", "Pandas", "TensorFlow", "PyTorch",
];

function extractSkills(text: string): { name: string; level: number; category: string }[] {
  const found = new Set<string>();
  for (const s of COMMON_SKILLS) {
    const re = new RegExp(`\\b${s.replace(/[.+]/g, "\\$&")}\\b`, "i");
    if (re.test(text)) found.add(s);
  }
  // Also harvest comma/、separated tokens under a Skills header, stopping at
  // the next section so neighbouring headings (Education, Experience…) don't leak.
  const lines = text.split(/\r?\n/).map((l) => l.trim());
  const hidx = lines.findIndex((l) => SKILL_HEADER.test(l) && l.length < 24);
  if (hidx !== -1) {
    for (const l of lines.slice(hidx + 1, hidx + 6)) {
      if (!l) continue;
      if (isHeader(l) || DATE_RANGE.test(l)) break; // reached the next section
      l.split(/[,，、|/]/)
        .map((t) => t.trim())
        .filter((t) => t.length >= 2 && t.length <= 20 && !isHeader(t))
        .slice(0, 8)
        .forEach((t) => found.add(t));
    }
  }
  const list = [...found].slice(0, 10);
  // Deterministic but varied proficiency so bars/radar look alive.
  return list.map((name, i) => ({
    name,
    level: 90 - ((i * 7) % 40),
    category: "",
  }));
}

const DATE_RANGE =
  /((19|20)\d{2})\s*[.\-–—/年]?\s*(\d{1,2}月?)?\s*[-–—~至到]\s*((19|20)\d{2}|至今|present|now|current)/i;

const SECTION_SPLIT = /\s*[—–|@·]\s*|\s+[-]\s+|\s{2,}/; // company/position separators

function splitRange(range: string): { startDate: string; endDate: string } {
  const years = range.match(/(19|20)\d{2}/g) ?? [];
  const present = /至今|present|now|current/i.test(range);
  return {
    startDate: years[0] ?? "",
    endDate: present ? "" : years[1] ?? "",
  };
}

function extractWork(
  lines: string[],
  _language: "zh" | "en",
): ResumeWork[] {
  const items: ResumeWork[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!DATE_RANGE.test(line)) continue;
    // Education entries also carry date ranges — let extractEducation own them.
    if (/university|college|institute|大学|学院|学校/i.test(line)) continue;

    const range = line.match(DATE_RANGE)![0];
    const { startDate, endDate } = splitRange(range);

    // Company / position often share the date line: "2020-present  Stripe — Staff Eng".
    const rest = line.replace(range, " ").trim();
    let company = "";
    let position = "";
    if (rest && !isHeader(rest)) {
      const parts = rest.split(SECTION_SPLIT).map((s) => s.trim()).filter(Boolean);
      company = parts[0] ?? "";
      position = parts[1] ?? "";
    }
    // Otherwise look at the neighbouring non-header line.
    if (!company) {
      const neighbour = [lines[i - 1], lines[i + 1]].find(
        (l) => l && !isHeader(l) && !DATE_RANGE.test(l) && l.length < 60,
      );
      if (neighbour) {
        const parts = neighbour.split(SECTION_SPLIT).map((s) => s.trim()).filter(Boolean);
        company = parts[0] ?? neighbour;
        position = parts[1] ?? "";
      }
    }
    if (!company) continue; // nothing usable

    items.push({
      company,
      position: position || company,
      startDate,
      endDate,
      summary: "",
      highlights: collectBullets(lines, i + 1),
    });
    if (items.length >= 5) break;
  }
  return items;
}

function collectBullets(lines: string[], from: number): string[] {
  const out: string[] = [];
  for (let i = from; i < Math.min(from + 6, lines.length); i++) {
    const l = lines[i];
    if (isHeader(l) || DATE_RANGE.test(l)) break; // next entry / section
    if (/^[•\-*·▪‣◦]/.test(l) || l.length > 25) {
      out.push(l.replace(/^[•\-*·▪‣◦]\s*/, ""));
    }
  }
  return out.slice(0, 4);
}

const EDU_HEADER = /(education|学历|教育背景|university|college|大学|学院)/i;
const DEGREE = /(bachelor|master|phd|b\.?s\.?|m\.?s\.?|本科|硕士|博士|学士)/i;

function extractEducation(
  lines: string[],
  _language: "zh" | "en",
): ResumeEducation[] {
  const out: ResumeEducation[] = [];
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (!/university|college|大学|学院|institute/i.test(l) || l.length > 80) continue;
    if (EDU_HEADER.test(l) && l.length < 24) continue; // skip the "Education" header itself

    const dateLine = [l, lines[i + 1]].find((x) => x && DATE_RANGE.test(x));
    const range = dateLine?.match(DATE_RANGE)?.[0] ?? "";
    const { startDate, endDate } = splitRange(range);

    // Pull the institution name out of a mixed line like
    // "2011 - 2015  Stanford University — B.S. Computer Science".
    const cleaned = l.replace(DATE_RANGE, " ").trim();
    const parts = cleaned.split(SECTION_SPLIT).map((s) => s.trim()).filter(Boolean);
    const institution =
      parts.find((p) => /university|college|大学|学院|institute/i.test(p)) ?? parts[0] ?? cleaned;
    const area = parts.find((p) => p !== institution && !DEGREE.test(p)) ?? "";

    out.push({
      institution,
      studyType: (cleaned.match(DEGREE)?.[0] ?? lines[i + 1]?.match(DEGREE)?.[0] ?? "").trim(),
      area: area || (lines[i + 1] && DEGREE.test(lines[i + 1]) ? lines[i + 1] : ""),
      startDate,
      endDate,
      score: "",
    });
    if (out.length >= 3) break;
  }
  return out;
}

function isHeader(l: string): boolean {
  return (
    l.length < 24 &&
    (SKILL_HEADER.test(l) ||
      EDU_HEADER.test(l) ||
      SUMMARY_HEADERS.test(l) ||
      /(experience|work|employment|工作经历|项目经历|projects?)/i.test(l))
  );
}

type ResumeWork = {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  summary: string;
  highlights: string[];
};
type ResumeEducation = {
  institution: string;
  area: string;
  studyType: string;
  startDate: string;
  endDate: string;
  score: string;
};
