"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { emptyResume, type ResumeData } from "@/lib/schema/resume";
import { DEFAULT_TEMPLATE_ID } from "@/components/templates/registry";

interface ResumeState {
  data: ResumeData;
  templateId: string;
  providerUsed: string;
  setData: (data: ResumeData) => void;
  setTemplate: (id: string) => void;
  setProviderUsed: (p: string) => void;
  /** Immutable update of a slice of the resume data. */
  patch: (updater: (prev: ResumeData) => ResumeData) => void;
  reset: () => void;
}

export const useResumeStore = create<ResumeState>()(
  persist(
    (set) => ({
      data: emptyResume(),
      templateId: DEFAULT_TEMPLATE_ID,
      providerUsed: "",
      setData: (data) => set({ data }),
      setTemplate: (templateId) => set({ templateId }),
      setProviderUsed: (providerUsed) => set({ providerUsed }),
      patch: (updater) => set((s) => ({ data: updater(s.data) })),
      reset: () => set({ data: emptyResume(), providerUsed: "" }),
    }),
    { name: "resume-visual" },
  ),
);
