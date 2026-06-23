"use client";

import { useState } from "react";
import { parseResumeData } from "@/lib/schema/resume";
import { useResumeStore, type Lang } from "@/store/resumeStore";

const LABELS: Record<Lang, string> = { zh: "中文", en: "EN" };

/**
 * 中文 / English toggle. Switching to a language we already have is instant;
 * otherwise it asks /api/translate to produce that variant once and caches it.
 */
export function LanguageToggle() {
  const displayLang = useResumeStore((s) => s.displayLang);
  const variants = useResumeStore((s) => s.variants);
  const setDisplayLang = useResumeStore((s) => s.setDisplayLang);
  const setVariant = useResumeStore((s) => s.setVariant);

  const [busy, setBusy] = useState<Lang | null>(null);
  const [error, setError] = useState("");

  async function selectLang(lang: Lang) {
    if (lang === displayLang) return;
    setError("");

    if (variants[lang]) {
      setDisplayLang(lang);
      return;
    }
    const source = variants[displayLang];
    if (!source) return;

    setBusy(lang);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: source, target: lang }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Translation failed.");
      setVariant(lang, parseResumeData(json.data));
      setDisplayLang(lang);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex overflow-hidden rounded-full border border-gray-200">
        {(["zh", "en"] as Lang[]).map((lang) => (
          <button
            key={lang}
            onClick={() => selectLang(lang)}
            disabled={busy !== null}
            className={`px-3 py-1 text-sm font-medium transition disabled:opacity-60 ${
              displayLang === lang
                ? "bg-tab-blue text-white"
                : "bg-white text-tab-slate hover:bg-gray-50"
            }`}
          >
            {busy === lang ? "翻译中…" : LABELS[lang]}
          </button>
        ))}
      </div>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
