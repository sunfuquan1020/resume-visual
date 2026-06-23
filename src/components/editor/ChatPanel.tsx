"use client";

import { useRef, useState } from "react";
import { parseResumeData } from "@/lib/schema/resume";
import { useActiveResume, useResumeStore } from "@/store/resumeStore";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS_ZH = ["把简介改得更简洁有力", "技能突出数据分析方向", "为每段经历补一句量化成果"];
const SUGGESTIONS_EN = [
  "Make my summary more concise",
  "Emphasize data-analysis skills",
  "Add a quantified result to each role",
];

/**
 * Resume-editing assistant. Sends the conversation + current resume to
 * /api/chat; the returned resume replaces the active language variant so the
 * preview updates live.
 */
export function ChatPanel({ onCollapse }: { onCollapse?: () => void }) {
  const resume = useActiveResume();
  const displayLang = useResumeStore((s) => s.displayLang);
  const setVariant = useResumeStore((s) => s.setVariant);

  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const zh = displayLang === "zh";
  const suggestions = zh ? SUGGESTIONS_ZH : SUGGESTIONS_EN;

  async function send(text: string) {
    const content = text.trim();
    if (!content || busy) return;
    const next = [...messages, { role: "user" as const, content }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, resume }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Chat failed.");
      setMessages((m) => [...m, { role: "assistant", content: json.reply }]);
      if (json.resume) setVariant(displayLang, parseResumeData(json.resume));
    } catch (e) {
      setMessages((m) => [...m, { role: "assistant", content: `⚠️ ${(e as Error).message}` }]);
    } finally {
      setBusy(false);
      requestAnimationFrame(() => listRef.current?.scrollTo(0, listRef.current.scrollHeight));
    }
  }

  return (
    <div className="flex h-full flex-col rounded-xl border bg-white">
      <div className="flex items-start justify-between border-b px-4 py-2.5">
        <div>
          <h2 className="text-sm font-bold text-tab-ink">AI 助手 · Assistant</h2>
          <p className="text-[11px] text-tab-slate">{zh ? "用对话修改简历内容" : "Edit your resume by chatting"}</p>
        </div>
        {onCollapse && (
          <button
            onClick={onCollapse}
            title={zh ? "收起" : "Collapse"}
            aria-label={zh ? "收起 AI 助手" : "Collapse assistant"}
            className="rounded-md px-2 py-1 text-tab-slate hover:bg-gray-100"
          >
            ✕
          </button>
        )}
      </div>

      <div ref={listRef} className="flex-1 space-y-3 overflow-auto px-4 py-3">
        {messages.length === 0 ? (
          <div className="space-y-2">
            <p className="text-[12.5px] text-tab-slate">
              {zh ? "试试这些：" : "Try one of these:"}
            </p>
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="block w-full rounded-lg border border-gray-200 px-3 py-2 text-left text-[12.5px] text-tab-ink hover:border-tab-blue hover:bg-tab-panel"
              >
                {s}
              </button>
            ))}
          </div>
        ) : (
          messages.map((m, i) => (
            <div
              key={i}
              className={`max-w-[88%] rounded-lg px-3 py-2 text-[12.5px] leading-snug ${
                m.role === "user"
                  ? "ml-auto bg-tab-blue text-white"
                  : "bg-tab-panel text-tab-ink"
              }`}
            >
              {m.content}
            </div>
          ))
        )}
        {busy && <div className="text-[12px] text-tab-slate">{zh ? "思考中…" : "Thinking…"}</div>}
      </div>

      <div className="border-t p-2">
        <div className="flex gap-2">
          <textarea
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            placeholder={zh ? "例如：把工作经历的要点改得更突出成果…" : "e.g. Make my highlights more results-focused…"}
            className="flex-1 resize-none rounded-lg border px-2 py-1.5 text-[12.5px] focus:border-tab-blue focus:outline-none"
          />
          <button
            onClick={() => send(input)}
            disabled={busy || !input.trim()}
            className="self-end rounded-lg bg-tab-blue px-3 py-1.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {zh ? "发送" : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
