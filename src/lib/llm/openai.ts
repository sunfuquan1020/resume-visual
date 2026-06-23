import OpenAI from "openai";
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
  type ProviderId,
} from "@/lib/llm/provider";

/**
 * OpenAI-compatible implementation. Works against OpenAI itself and any
 * compatible endpoint (gateways, local servers) by setting baseURL.
 */
export class OpenAICompatProvider implements LLMProvider {
  readonly id: ProviderId;
  private client: OpenAI;
  private model: string;
  private useJsonSchema: boolean;

  constructor(opts: {
    id: ProviderId;
    apiKey: string;
    baseURL: string;
    model: string;
    useJsonSchema?: boolean;
  }) {
    this.id = opts.id;
    this.model = opts.model;
    this.useJsonSchema = opts.useJsonSchema ?? true;
    this.client = new OpenAI({ apiKey: opts.apiKey, baseURL: opts.baseURL });
  }

  async extractResume(text: string, opts: ExtractOptions): Promise<ResumeData> {
    const data = parseResumeData(
      await this.complete(buildSystemPrompt(opts.language), buildUserPrompt(text), RESUME_JSON_SCHEMA),
    );
    data.meta.source = this.id;
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
    data.meta.source = this.id;
    return data;
  }

  async complete(system: string, user: string, schema: object): Promise<unknown> {
    const response_format = this.useJsonSchema
      ? ({
          type: "json_schema",
          json_schema: { name: "result", schema },
        } as const)
      : ({ type: "json_object" } as const);

    const res = await this.client.chat.completions.create({
      model: this.model,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      response_format: response_format as any,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    });
    return parseJsonLoose(res.choices[0]?.message?.content ?? "");
  }
}
