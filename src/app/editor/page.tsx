"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ResumeForm } from "@/components/editor/ResumeForm";
import { ExportButtons } from "@/components/editor/ExportButtons";
import { LanguageToggle } from "@/components/editor/LanguageToggle";
import { TEMPLATES, getTemplate } from "@/components/templates/registry";
import { useActiveResume, useResumeStore } from "@/store/resumeStore";

export default function EditorPage() {
  const data = useActiveResume();
  const templateId = useResumeStore((s) => s.templateId);
  const setTemplate = useResumeStore((s) => s.setTemplate);
  const providerUsed = useResumeStore((s) => s.providerUsed);

  const previewRef = useRef<HTMLDivElement>(null);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const Template = getTemplate(templateId).Component;
  const hasData = data.basics.name || data.work.length > 0 || data.skills.length > 0;

  if (!hydrated) {
    return <div className="p-10 text-tab-slate">加载中…</div>;
  }

  return (
    <main className="min-h-screen">
      {/* Top bar */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-lg font-bold text-tab-navy">
            可视化简历
          </Link>
          {providerUsed && (
            <span className="rounded-full bg-tab-panel px-2 py-0.5 text-xs text-tab-slate">
              解析引擎: {providerUsed}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <LanguageToggle />
          <Link href="/" className="text-sm font-medium text-tab-slate hover:text-tab-blue">
            ← 重新上传
          </Link>
          <ExportButtons targetRef={previewRef} filename={data.basics.name || "resume"} />
        </div>
      </header>

      <div className="grid grid-cols-[320px_1fr] gap-6 p-6">
        {/* Left: template chooser + form */}
        <div className="flex flex-col gap-5">
          <section>
            <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-tab-slate">
              选择模版 Template
            </h2>
            <div className="flex flex-col gap-2">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTemplate(t.id)}
                  className={`rounded-lg border-2 p-3 text-left transition ${
                    t.id === templateId
                      ? "border-tab-blue bg-tab-panel"
                      : "border-transparent bg-white hover:border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ background: t.accent }}
                    />
                    <span className="text-sm font-semibold text-tab-ink">{t.name}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-tab-slate">{t.description}</p>
                </button>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-tab-slate">
              编辑内容 Edit
            </h2>
            <ResumeForm />
          </section>
        </div>

        {/* Right: live preview */}
        <div className="overflow-auto">
          {hasData ? (
            <div className="mx-auto w-full max-w-[1100px]">
              <div ref={previewRef} className="overflow-hidden rounded-xl shadow-lg ring-1 ring-black/5">
                <Template data={data} />
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center rounded-xl border-2 border-dashed text-tab-slate">
              <div className="text-center">
                <p>还没有简历数据。</p>
                <Link href="/" className="mt-2 inline-block font-medium text-tab-blue hover:underline">
                  ← 返回上传
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
