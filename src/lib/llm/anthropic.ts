import Anthropic from "@anthropic-ai/sdk";
import { parseResumeData, type ResumeData } from "@/lib/schema/resume";
import {
  RESUME_JSON_SCHEMA,
  buildSystemPrompt,
  buildTranslateSystemPrompt,
  buildTranslateUserPrompt,
  buildUserPrompt,
} from "@/lib/llm/prompt";
import type { ExtractOptions, LLMProvider } from "@/lib/llm/provider";

/** Claude implementation using tool-use to force a JSON-schema-shaped result. */
export class AnthropicProvider implements LLMProvider {
  readonly id = "anthropic" as const;
  private client: Anthropic;
  private model: string;

  constructor(apiKey: string, model: string) {
    this.client = new Anthropic({ apiKey });
    this.model = model;
  }

  async extractResume(text: string, opts: ExtractOptions): Promise<ResumeData> {
    const data = parseResumeData(
      await this.complete(buildSystemPrompt(opts.language), buildUserPrompt(text), RESUME_JSON_SCHEMA),
    );
    data.meta.source = "anthropic";
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
    data.meta.source = "anthropic";
    return data;
  }

  async complete(system: string, user: string, schema: object): Promise<unknown> {
    const res = await this.client.messages.create({
      model: this.model,
      max_tokens: 4096,
      system,
      tools: [
        {
          name: "emit",
          description: "Emit the structured result.",
          input_schema: schema as Anthropic.Tool.InputSchema,
        },
      ],
      tool_choice: { type: "tool", name: "emit" },
      messages: [{ role: "user", content: user }],
    });

    const toolUse = res.content.find((c) => c.type === "tool_use");
    if (!toolUse || toolUse.type !== "tool_use") {
      throw new Error("Claude did not return a structured result.");
    }
    return toolUse.input;
  }
}
