"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { parseResumeData, type ResumeData } from "@/lib/schema/resume";
import { useResumeStore } from "@/store/resumeStore";

type Lang = "auto" | "zh" | "en";

export default function UploadPage() {
  const router = useRouter();
  const setExtracted = useResumeStore((s) => s.setExtracted);

  const [language, setLanguage] = useState<Lang>("auto");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setBusy(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("language", language);
      const res = await fetch("/api/extract", { method: "POST", body: form });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Extraction failed.");
      setExtracted(parseResumeData(json.data), json.provider || "");
      router.push("/editor");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-tab-navy">
          可视化简历 <span className="text-tab-blue">Resume Visualizer</span>
        </h1>
        <p className="mt-3 text-tab-slate">
          上传简历，自动提取关键信息，一键生成类 Tableau 的可视化简历。
        </p>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const f = e.dataTransfer.files?.[0];
          if (f) handleFile(f);
        }}
        onClick={() => inputRef.current?.click()}
        className={`flex w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-white p-12 text-center transition ${
          dragOver ? "border-tab-blue bg-tab-panel" : "border-gray-300 hover:border-tab-blue"
        }`}
      >
        <div className="text-5xl">📄</div>
        <p className="mt-4 text-lg font-medium text-tab-ink">
          {busy ? "正在分析简历…" : "拖拽文件到此处，或点击选择"}
        </p>
        <p className="mt-1 text-sm text-tab-slate">支持 PDF / DOCX / TXT，最大 8MB</p>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.txt,.md,application/pdf"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
      </div>

      <div className="mt-5 flex items-center gap-3">
        <span className="text-sm text-tab-slate">简历语言：</span>
        {(["auto", "zh", "en"] as Lang[]).map((l) => (
          <button
            key={l}
            onClick={() => setLanguage(l)}
            className={`rounded-full px-3 py-1 text-sm font-medium transition ${
              language === l ? "bg-tab-blue text-white" : "bg-white text-tab-slate hover:bg-gray-100"
            }`}
          >
            {l === "auto" ? "自动" : l === "zh" ? "中文" : "English"}
          </button>
        ))}
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
      )}

      {busy && (
        <div className="mt-4 h-1 w-48 overflow-hidden rounded-full bg-gray-200">
          <div className="h-full w-1/3 animate-pulse rounded-full bg-tab-blue" />
        </div>
      )}

      <p className="mt-10 max-w-md text-center text-xs text-tab-slate">
        无需 API Key 即可体验（内置规则解析）。配置 Claude / OpenAI / 本地 Ollama 后可获得更高
        提取质量 —— 见 <code className="rounded bg-gray-100 px-1">.env.example</code>。
      </p>

      <button
        onClick={() => {
          loadSample(setExtracted);
          router.push("/editor");
        }}
        className="mt-4 text-sm font-medium text-tab-blue hover:underline"
      >
        没有简历？加载示例 →
      </button>
    </main>
  );
}

function loadSample(setExtracted: (d: ResumeData, provider: string) => void) {
  setExtracted(
    parseResumeData({
      basics: {
        name: "Eric Li",
        label: "Senior Data Engineer",
        email: "eric.li@example.com",
        phone: "+86 138 0000 1234",
        url: "https://ericli.dev",
        summary:
          "Data engineer with 8+ years building large-scale analytics platforms. Passionate about turning raw data into clear, decision-ready visualizations.",
        location: { city: "Shanghai" },
        profiles: [{ network: "GitHub", username: "ericli", url: "github.com/ericli" }],
      },
      work: [
        {
          company: "Acme Analytics",
          position: "Senior Data Engineer",
          startDate: "2021",
          endDate: "",
          highlights: [
            "Built a real-time pipeline processing 2B+ events/day.",
            "Cut dashboard load times by 70% via query optimization.",
          ],
        },
        {
          company: "DataWorks",
          position: "Data Engineer",
          startDate: "2017",
          endDate: "2021",
          highlights: ["Designed the company-wide data warehouse on Snowflake."],
        },
      ],
      education: [
        {
          institution: "Fudan University",
          studyType: "B.S.",
          area: "Computer Science",
          startDate: "2013",
          endDate: "2017",
        },
      ],
      skills: [
        { name: "Python", level: 96 },
        { name: "SQL", level: 90 },
        { name: "Tableau", level: 82 },
        { name: "Spark", level: 66 },
        { name: "AWS", level: 54 },
        { name: "Airflow", level: 40 },
        { name: "Docker", level: 24 },
      ],
      stats: [
        { label: "Years Experience", value: "8+" },
        { label: "Companies", value: "2" },
        { label: "Core Skills", value: "7" },
      ],
      meta: { language: "en", source: "sample" },
    }),
    "sample",
  );
}
