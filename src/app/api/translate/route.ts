import { NextResponse } from "next/server";
import { getProvider } from "@/lib/llm";
import { enrichResume, reconcileVariant } from "@/lib/resume/enrich";
import { parseResumeData, type ResumeData } from "@/lib/schema/resume";

export const runtime = "nodejs";
export const maxDuration = 180;

/**
 * POST /api/translate
 * body: { data: ResumeData, target: "zh" | "en" }
 * → { ok, data, provider }
 *
 * Translates an already-extracted resume into the other language so the UI can
 * offer a zh/en toggle without re-uploading. Falls back to a relabel if the
 * provider can't translate (mock) or errors.
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { data?: unknown; target?: string };
    const target = body.target === "zh" ? "zh" : "en";
    const source = parseResumeData(body.data);

    const { provider } = getProvider();
    let data: ResumeData;
    try {
      data = await provider.translateResume(source, target);
    } catch {
      // Best-effort fallback: keep content, just switch the language label.
      data = parseResumeData({ ...source, meta: { ...source.meta, language: target } });
    }

    // Restore any items the model dropped, then fill stats/label.
    const result = enrichResume(reconcileVariant(data, source));
    return NextResponse.json({ ok: true, data: result, provider: result.meta.source });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: (err as Error).message ?? "Translation failed." },
      { status: 500 },
    );
  }
}
