"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ResumeForm } from "@/components/editor/ResumeForm";
import { ExportButtons } from "@/components/editor/ExportButtons";
import { LanguageToggle } from "@/components/editor/LanguageToggle";
import { ChatPanel } from "@/components/editor/ChatPanel";
import { TEMPLATES, getTemplate } from "@/components/templates/registry";
import { useActiveResume, useResumeStore } from "@/store/resumeStore";

export default function EditorPage() {
  const data = useActiveResume();
  const templateId = useResumeStore((s) => s.templateId);
  const setTemplate = useResumeStore((s) => s.setTemplate);
  const providerUsed = useResumeStore((s) => s.providerUsed);

  const previewRef = useRef<HTMLDivElement>(null);
  const [hydrated, setHydrated] = useState(false);
  const [showChat, setShowChat] = useState(true);
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
          <button
            onClick={() => setShowChat((v) => !v)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              showChat ? "bg-tab-blue text-white" : "bg-white text-tab-slate hover:bg-gray-100"
            }`}
          >
            AI 助手
          </button>
          <Link href="/" className="text-sm font-medium text-tab-slate hover:text-tab-blue">
            ← 重新上传
          </Link>
          <ExportButtons targetRef={previewRef} filename={data.basics.name || "resume"} />
        </div>
      </header>

      <div
        className="grid gap-6 p-6"
        style={{ gridTemplateColumns: showChat ? "300px 1fr 360px" : "300px 1fr" }}
      >
        {/* Left: template dropdown + form */}
        <div className="flex flex-col gap-5">
          <section>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-tab-slate">
              选择模版 Template
            </label>
            <select
              value={templateId}
              onChange={(e) => setTemplate(e.target.value)}
              className="w-full rounded-lg border bg-white px-3 py-2 text-sm font-medium text-tab-ink focus:border-tab-blue focus:outline-none"
            >
              {TEMPLATES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-tab-slate">{getTemplate(templateId).description}</p>
          </section>

          <section>
            <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-tab-slate">
              编辑内容 Edit
            </h2>
            <ResumeForm />
          </section>
        </div>

        {/* Center: live preview */}
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

        {/* Right: AI assistant */}
        {showChat && (
          <div className="sticky top-[68px] h-[calc(100vh-92px)]">
            <ChatPanel onCollapse={() => setShowChat(false)} />
          </div>
        )}
      </div>

      {/* Floating tab to reopen the assistant when collapsed */}
      {!showChat && (
        <button
          onClick={() => setShowChat(true)}
          className="fixed right-0 top-1/2 z-20 -translate-y-1/2 rounded-l-lg bg-tab-blue px-2 py-3 text-sm font-medium text-white shadow-lg hover:opacity-90"
          style={{ writingMode: "vertical-rl" }}
          title="展开 AI 助手"
        >
          AI 助手
        </button>
      )}
    </main>
  );
}
