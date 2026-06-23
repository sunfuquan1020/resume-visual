"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { emptyResume, type ResumeData } from "@/lib/schema/resume";
import { DEFAULT_TEMPLATE_ID } from "@/components/templates/registry";

export type Lang = "zh" | "en";

/** Stable empty instance so the active-resume selector never returns a new ref. */
const EMPTY = emptyResume();

function other(lang: Lang): Lang {
  return lang === "zh" ? "en" : "zh";
}

interface ResumeState {
  /** Cached resume per language; filled on extract and on translate. */
  variants: Partial<Record<Lang, ResumeData>>;
  displayLang: Lang;
  templateId: string;
  providerUsed: string;

  setExtracted: (data: ResumeData, provider: string) => void;
  setVariant: (lang: Lang, data: ResumeData) => void;
  setDisplayLang: (lang: Lang) => void;
  /** Immutable update of the currently displayed language variant. */
  patchActive: (updater: (prev: ResumeData) => ResumeData) => void;
  setTemplate: (id: string) => void;
  reset: () => void;
}

export const useResumeStore = create<ResumeState>()(
  persist(
    (set) => ({
      variants: {},
      displayLang: "en",
      templateId: DEFAULT_TEMPLATE_ID,
      providerUsed: "",

      setExtracted: (data, provider) =>
        set({
          variants: { [data.meta.language]: data },
          displayLang: data.meta.language,
          providerUsed: provider,
        }),

      setVariant: (lang, data) =>
        set((s) => ({ variants: { ...s.variants, [lang]: data } })),

      setDisplayLang: (displayLang) => set({ displayLang }),

      patchActive: (updater) =>
        set((s) => {
          const current = s.variants[s.displayLang];
          if (!current) return s;
          return { variants: { ...s.variants, [s.displayLang]: updater(current) } };
        }),

      setTemplate: (templateId) => set({ templateId }),
      reset: () => set({ variants: {}, displayLang: "en", providerUsed: "" }),
    }),
    { name: "resume-visual" },
  ),
);

/** The resume for the active language (falls back to the other, then empty). */
export function useActiveResume(): ResumeData {
  return useResumeStore(
    (s) => s.variants[s.displayLang] ?? s.variants[other(s.displayLang)] ?? EMPTY,
  );
}

/** Whether a translation already exists for a language (no API call needed). */
export function useHasVariant(lang: Lang): boolean {
  return useResumeStore((s) => Boolean(s.variants[lang]));
}
