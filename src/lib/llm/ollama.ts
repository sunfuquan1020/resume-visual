import { parseResumeData, type ResumeData } from "@/lib/schema/resume";
import {
  RESUME_JSON_SCHEMA,
  buildSystemPrompt,
  buildTranslateSystemPrompt,
  buildTranslateUserPrompt,
  buildUserPrompt,
} from "@/lib/llm/prompt";
import {
  parseJsonLoose,
  type ExtractOptions,
  type LLMProvider,
} from "@/lib/llm/provider";

const DEFAULT_HOST = "http://127.0.0.1:11434";
const REQUEST_TIMEOUT_MS = 180_000;

/**
 * Normalize a user-provided OLLAMA_HOST so common mistakes still work:
 *   "0.0.0.0"            → http://127.0.0.1:11434  (bind-all isn't connectable)
 *   "localhost:11434"    → http://localhost:11434  (missing scheme)
 *   "http://host"        → http://host:11434       (missing port)
 */
export function normalizeOllamaHost(raw?: string): string {
  let h = (raw ?? DEFAULT_HOST).trim();
  if (!h) return DEFAULT_HOST;
  if (!/^https?:\/\//i.test(h)) h = `http://${h}`;
  try {
    const url = new URL(h);
    if (url.hostname === "0.0.0.0") url.hostname = "127.0.0.1";
    if (!url.port) url.port = "11434";
    return url.origin;
  } catch {
    return DEFAULT_HOST;
  }
}

/**
 * Local Ollama implementation using the native /api/chat endpoint with
 * structured outputs (format = JSON schema). Runs fully offline.
 */
export class OllamaProvider implements LLMProvider {
  readonly id = "ollama" as const;
  private host: string;
  private model: string;

  constructor(host: string, model: string) {
    this.host = normalizeOllamaHost(host);
    this.model = model;
  }

  async extractResume(text: string, opts: ExtractOptions): Promise<ResumeData> {
    const data = parseResumeData(
      await this.complete(buildSystemPrompt(opts.language), buildUserPrompt(text), RESUME_JSON_SCHEMA),
    );
    data.meta.source = "ollama";
    return data;
  }

  async translateResume(input: ResumeData, target: "zh" | "en"): Promise<ResumeData> {
    const data = parseResumeData(
      await this.complete(
        buildTranslateSystemPrompt(target),
        buildTranslateUserPrompt(JSON.stringify(input)),
        RESUME_JSON_SCHEMA,
      ),
    );
    data.meta.language = target;
    data.meta.source = "ollama";
    return data;
  }

  async complete(system: string, user: string, schema: object): Promise<unknown> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    let res: Response;
    try {
      res = await fetch(`${this.host}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          model: this.model,
          stream: false,
          think: false,
          format: schema,
          options: { temperature: 0.2 },
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
        }),
      });
    } catch (err) {
      const reason = (err as Error).name === "AbortError" ? "timed out" : (err as Error).message;
      throw new Error(
        `Ollama request failed (${reason}). Check that Ollama is running and OLLAMA_HOST=${this.host} is reachable.`,
      );
    } finally {
      clearTimeout(timer);
    }

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(
        `Ollama returned ${res.status}. Is the model "${this.model}" pulled? (ollama pull ${this.model}) ${body.slice(0, 200)}`,
      );
    }

    const json = (await res.json()) as { message?: { content?: string } };
    const content = json.message?.content ?? "";
    if (!content.trim()) throw new Error("Ollama returned an empty response.");
    return parseJsonLoose(content);
  }
}
