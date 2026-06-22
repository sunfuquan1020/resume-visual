import { NextResponse } from "next/server";
import { detectKind, extractText } from "@/lib/extract/text";
import { getProvider } from "@/lib/llm";
import { enrichResume } from "@/lib/resume/enrich";
import { emptyResume } from "@/lib/schema/resume";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

/**
 * POST /api/extract
 * multipart/form-data: file=<resume>, language=zh|en|auto
 * → { ok, data: ResumeData, provider }
 */
export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    const language = (form.get("language") as string) || "auto";

    if (!(file instanceof File)) {
      return bad("No file uploaded.");
    }
    if (file.size > MAX_BYTES) {
      return bad("File too large (max 8 MB).");
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const kind = detectKind(file.name, file.type);
    if (kind === "unknown") {
      return bad("Unsupported file type. Upload a PDF, DOCX, or text resume.");
    }

    const text = await extractText(buffer, kind);
    if (text.trim().length < 20) {
      return bad(
        "Could not read text from this file. It may be a scanned image (OCR not supported in this version).",
      );
    }

    const { provider } = getProvider();
    let data;
    try {
      data = await provider.extractResume(text, {
        language: language as "zh" | "en" | "auto",
      });
    } catch (err) {
      // If a configured cloud/local provider fails, fall back to the rule-based
      // extractor so the user still gets a result.
      const { MockProvider } = await import("@/lib/llm/mock");
      data = await new MockProvider().extractResume(text, {
        language: language as "zh" | "en" | "auto",
      });
      data.meta.source = `mock (fallback: ${(err as Error).message})`;
    }

    // Fill headline stats / label if the provider omitted them.
    const enriched = enrichResume(data);

    return NextResponse.json({
      ok: true,
      data: enriched,
      provider: enriched.meta.source,
    });
  } catch (err) {
    console.error("[extract] error:", err);
    return NextResponse.json(
      { ok: false, error: (err as Error).message ?? "Extraction failed.", data: emptyResume() },
      { status: 500 },
    );
  }
}

function bad(message: string) {
  return NextResponse.json({ ok: false, error: message }, { status: 400 });
}
