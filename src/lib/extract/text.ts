/**
 * File → plain text extraction.
 * Supports PDF (text layer via unpdf), DOCX (mammoth) and plain text.
 * Image / scanned-PDF OCR is intentionally out of scope for v1; those files
 * yield empty text and the caller surfaces a clear error.
 */

export type ExtractKind = "pdf" | "docx" | "text" | "unknown";

export function detectKind(filename: string, mime: string): ExtractKind {
  const lower = filename.toLowerCase();
  if (mime === "application/pdf" || lower.endsWith(".pdf")) return "pdf";
  if (
    mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    lower.endsWith(".docx")
  )
    return "docx";
  if (mime.startsWith("text/") || lower.endsWith(".txt") || lower.endsWith(".md")) return "text";
  return "unknown";
}

export async function extractText(
  buffer: Buffer,
  kind: ExtractKind,
): Promise<string> {
  switch (kind) {
    case "pdf":
      return extractPdf(buffer);
    case "docx":
      return extractDocx(buffer);
    case "text":
      return buffer.toString("utf-8");
    default:
      throw new Error(
        "Unsupported file type. Please upload a PDF, DOCX, or plain-text resume.",
      );
  }
}

async function extractPdf(buffer: Buffer): Promise<string> {
  const { extractText: pdfExtract, getDocumentProxy } = await import("unpdf");
  const doc = await getDocumentProxy(new Uint8Array(buffer));
  const { text } = await pdfExtract(doc, { mergePages: true });
  return (Array.isArray(text) ? text.join("\n") : text).trim();
}

async function extractDocx(buffer: Buffer): Promise<string> {
  const mammoth = await import("mammoth");
  const { value } = await mammoth.extractRawText({ buffer });
  return value.trim();
}
