"use client";

import { useState, type RefObject } from "react";

/** PNG + PDF export of a DOM node, fully client-side (no server needed). */
export function ExportButtons({
  targetRef,
  filename = "resume",
}: {
  targetRef: RefObject<HTMLElement | null>;
  filename?: string;
}) {
  const [busy, setBusy] = useState<"" | "png" | "pdf">("");

  async function renderPng(scale = 2): Promise<string> {
    const node = targetRef.current;
    if (!node) throw new Error("Nothing to export yet.");
    const { toPng } = await import("html-to-image");
    return toPng(node, {
      pixelRatio: scale,
      cacheBust: true,
      backgroundColor: "#ffffff",
    });
  }

  async function exportPng() {
    setBusy("png");
    try {
      const dataUrl = await renderPng(2);
      triggerDownload(dataUrl, `${filename}.png`);
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setBusy("");
    }
  }

  async function exportPdf() {
    setBusy("pdf");
    try {
      const node = targetRef.current!;
      const dataUrl = await renderPng(2);
      const { jsPDF } = await import("jspdf");
      const w = node.offsetWidth;
      const h = node.offsetHeight;
      const pdf = new jsPDF({
        orientation: h >= w ? "portrait" : "landscape",
        unit: "px",
        format: [w, h],
      });
      pdf.addImage(dataUrl, "PNG", 0, 0, w, h);
      pdf.save(`${filename}.pdf`);
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setBusy("");
    }
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={exportPng}
        disabled={busy !== ""}
        className="rounded-lg bg-tab-blue px-3 py-1.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
      >
        {busy === "png" ? "导出中…" : "导出 PNG"}
      </button>
      <button
        onClick={exportPdf}
        disabled={busy !== ""}
        className="rounded-lg bg-tab-navy px-3 py-1.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
      >
        {busy === "pdf" ? "导出中…" : "导出 PDF"}
      </button>
    </div>
  );
}

function triggerDownload(dataUrl: string, name: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = name;
  a.click();
}
