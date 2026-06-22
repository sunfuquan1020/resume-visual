import type { ResumeData } from "@/lib/schema/resume";

export type ProviderId = "anthropic" | "openai" | "ollama" | "mock";

export interface ExtractOptions {
  language: "zh" | "en" | "auto";
}

/**
 * Vendor-agnostic extraction contract. Every implementation takes resume text
 * and returns a validated ResumeData. Implementations live in sibling files.
 */
export interface LLMProvider {
  readonly id: ProviderId;
  extractResume(text: string, opts: ExtractOptions): Promise<ResumeData>;
}

/** Pull a clean JSON object out of a model's raw text response. */
export function parseJsonLoose(raw: string): unknown {
  const trimmed = raw.trim();
  // Strip markdown fences if present.
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = fenced ? fenced[1] : trimmed;
  try {
    return JSON.parse(body);
  } catch {
    // Last resort: grab the outermost {...}.
    const start = body.indexOf("{");
    const end = body.lastIndexOf("}");
    if (start !== -1 && end > start) {
      return JSON.parse(body.slice(start, end + 1));
    }
    throw new Error("Model did not return valid JSON.");
  }
}
