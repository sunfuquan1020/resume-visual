import Anthropic from "@anthropic-ai/sdk";
import { parseResumeData, type ResumeData } from "@/lib/schema/resume";
import {
  RESUME_JSON_SCHEMA,
  buildSystemPrompt,
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
    const res = await this.client.messages.create({
      model: this.model,
      max_tokens: 4096,
      system: buildSystemPrompt(opts.language),
      tools: [
        {
          name: "emit_resume",
          description: "Emit the structured resume data.",
          input_schema: RESUME_JSON_SCHEMA as unknown as Anthropic.Tool.InputSchema,
        },
      ],
      tool_choice: { type: "tool", name: "emit_resume" },
      messages: [{ role: "user", content: buildUserPrompt(text) }],
    });

    const toolUse = res.content.find((c) => c.type === "tool_use");
    if (!toolUse || toolUse.type !== "tool_use") {
      throw new Error("Claude did not return structured resume data.");
    }
    const data = parseResumeData(toolUse.input);
    data.meta.source = "anthropic";
    return data;
  }
}
