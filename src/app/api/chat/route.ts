import { NextResponse } from "next/server";
import { getProvider } from "@/lib/llm";
import {
  CHAT_SCHEMA,
  buildChatSystemPrompt,
  buildChatUserPrompt,
  type ChatTurn,
} from "@/lib/llm/prompt";
import { enrichResume, reconcileVariant } from "@/lib/resume/enrich";
import { parseResumeData } from "@/lib/schema/resume";

export const runtime = "nodejs";
export const maxDuration = 180;

/**
 * POST /api/chat
 * body: { messages: ChatTurn[], resume: ResumeData }
 * → { ok, reply, resume }   (resume is the updated, validated ResumeData)
 *
 * The resume-editing assistant: applies the user's requested changes to the
 * current resume and returns both a chat reply and the updated resume.
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { messages?: ChatTurn[]; resume?: unknown };
    const history = (body.messages ?? []).slice(-12); // cap context
    const source = parseResumeData(body.resume);
    if (history.length === 0) {
      return NextResponse.json({ ok: false, error: "No message." }, { status: 400 });
    }

    const { provider } = getProvider();
    const lang = source.meta.language;

    let raw: unknown;
    try {
      raw = await provider.complete(
        buildChatSystemPrompt(lang),
        buildChatUserPrompt(JSON.stringify(source), history),
        CHAT_SCHEMA,
      );
    } catch (err) {
      // No LLM configured (mock) or provider error — reply without editing.
      return NextResponse.json({
        ok: true,
        reply: (err as Error).message,
        resume: source,
      });
    }

    const out = (raw ?? {}) as { reply?: string; resume?: unknown };
    const updated = enrichResume(reconcileVariant(parseResumeData(out.resume), source));
    updated.meta.language = lang;

    return NextResponse.json({
      ok: true,
      reply: out.reply || (lang === "zh" ? "已更新简历。" : "Resume updated."),
      resume: updated,
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: (err as Error).message ?? "Chat failed." },
      { status: 500 },
    );
  }
}
