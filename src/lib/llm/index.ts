import { AnthropicProvider } from "@/lib/llm/anthropic";
import { OpenAICompatProvider } from "@/lib/llm/openai";
import { OllamaProvider } from "@/lib/llm/ollama";
import { MockProvider } from "@/lib/llm/mock";
import type { LLMProvider, ProviderId } from "@/lib/llm/provider";

/**
 * Resolve the active provider from env. Falls back to the rule-based mock
 * extractor whenever the requested provider lacks the credentials it needs,
 * so the app always works out of the box.
 */
export function getProvider(): { provider: LLMProvider; requested: ProviderId } {
  const requested = (process.env.LLM_PROVIDER ?? "mock").toLowerCase() as ProviderId;

  switch (requested) {
    case "anthropic": {
      const key = process.env.ANTHROPIC_API_KEY;
      if (key) {
        return {
          provider: new AnthropicProvider(
            key,
            process.env.ANTHROPIC_MODEL ?? "claude-opus-4-8",
          ),
          requested,
        };
      }
      break;
    }
    case "openai": {
      const key = process.env.OPENAI_API_KEY;
      if (key) {
        return {
          provider: new OpenAICompatProvider({
            id: "openai",
            apiKey: key,
            baseURL: process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1",
            model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
          }),
          requested,
        };
      }
      break;
    }
    case "openrouter": {
      // OpenRouter is OpenAI-compatible — reuse the same provider with its baseURL.
      const key = process.env.OPENROUTER_API_KEY;
      if (key) {
        return {
          provider: new OpenAICompatProvider({
            id: "openrouter",
            apiKey: key,
            baseURL: process.env.OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1",
            model: process.env.OPENROUTER_MODEL ?? "openai/gpt-4o-mini",
          }),
          requested,
        };
      }
      break;
    }
    case "ollama": {
      return {
        provider: new OllamaProvider(
          process.env.OLLAMA_HOST ?? "http://localhost:11434",
          process.env.OLLAMA_MODEL ?? "qwen2.5",
        ),
        requested,
      };
    }
    default:
      break;
  }

  // No credentials / unknown provider → rule-based fallback.
  return { provider: new MockProvider(), requested };
}
