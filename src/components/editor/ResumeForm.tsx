"use client";

import type { ResumeData } from "@/lib/schema/resume";
import { useResumeStore } from "@/store/resumeStore";

/**
 * Lightweight editor for the most-visible fields. Updates are immutable —
 * each change returns a new ResumeData via the store's patch().
 */
export function ResumeForm() {
  const data = useResumeStore((s) => s.data);
  const patch = useResumeStore((s) => s.patch);

  const setBasics = (key: keyof ResumeData["basics"], value: string) =>
    patch((d) => ({ ...d, basics: { ...d.basics, [key]: value } }));

  const setSkillLevel = (idx: number, level: number) =>
    patch((d) => ({
      ...d,
      skills: d.skills.map((s, i) => (i === idx ? { ...s, level } : s)),
    }));

  const setSkillName = (idx: number, name: string) =>
    patch((d) => ({
      ...d,
      skills: d.skills.map((s, i) => (i === idx ? { ...s, name } : s)),
    }));

  const setStat = (idx: number, key: "label" | "value", v: string) =>
    patch((d) => ({
      ...d,
      stats: d.stats.map((s, i) => (i === idx ? { ...s, [key]: v } : s)),
    }));

  return (
    <div className="flex flex-col gap-5 text-sm">
      <Group title="基本信息 Basics">
        <Field label="姓名 Name" value={data.basics.name} onChange={(v) => setBasics("name", v)} />
        <Field label="头衔 Title" value={data.basics.label} onChange={(v) => setBasics("label", v)} />
        <Field label="邮箱 Email" value={data.basics.email} onChange={(v) => setBasics("email", v)} />
        <Field label="电话 Phone" value={data.basics.phone} onChange={(v) => setBasics("phone", v)} />
        <Field
          label="城市 City"
          value={data.basics.location.city}
          onChange={(v) =>
            patch((d) => ({
              ...d,
              basics: { ...d.basics, location: { ...d.basics.location, city: v } },
            }))
          }
        />
        <Area
          label="简介 Summary"
          value={data.basics.summary}
          onChange={(v) => setBasics("summary", v)}
        />
      </Group>

      {data.stats.length > 0 && (
        <Group title="统计卡片 Stats">
          {data.stats.map((s, i) => (
            <div key={i} className="flex gap-2">
              <input
                className="w-16 rounded border px-2 py-1"
                value={s.value}
                onChange={(e) => setStat(i, "value", e.target.value)}
              />
              <input
                className="flex-1 rounded border px-2 py-1"
                value={s.label}
                onChange={(e) => setStat(i, "label", e.target.value)}
              />
            </div>
          ))}
        </Group>
      )}

      {data.skills.length > 0 && (
        <Group title="技能熟练度 Skills">
          {data.skills.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                className="w-28 rounded border px-2 py-1"
                value={s.name}
                onChange={(e) => setSkillName(i, e.target.value)}
              />
              <input
                type="range"
                min={0}
                max={100}
                value={s.level}
                onChange={(e) => setSkillLevel(i, Number(e.target.value))}
                className="flex-1 accent-tab-blue"
              />
              <span className="w-8 text-right tabular-nums text-tab-slate">{s.level}</span>
            </div>
          ))}
        </Group>
      )}
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="rounded-lg border bg-white p-3">
      <legend className="px-1 text-xs font-bold uppercase tracking-wide text-tab-blue">
        {title}
      </legend>
      <div className="flex flex-col gap-2">{children}</div>
    </fieldset>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] font-medium text-tab-slate">{label}</span>
      <input
        className="rounded border px-2 py-1"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function Area({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] font-medium text-tab-slate">{label}</span>
      <textarea
        rows={4}
        className="rounded border px-2 py-1"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
