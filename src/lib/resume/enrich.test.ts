import { describe, expect, test } from "vitest";
import { parseResumeData } from "@/lib/schema/resume";
import { enrichResume, estimateYears } from "@/lib/resume/enrich";
import { normalizeOllamaHost } from "@/lib/llm/ollama";

describe("enrichResume", () => {
  test("fills stats when the provider omitted them", () => {
    const data = parseResumeData({
      work: [{ company: "A", position: "Eng", startDate: "2019", endDate: "" }],
      skills: [{ name: "Go" }, { name: "Rust" }],
      meta: { language: "en" },
    });
    expect(data.stats).toEqual([]);
    const out = enrichResume(data);
    expect(out.stats.length).toBe(3);
    expect(out.stats[1].value).toBe("1"); // one company
  });

  test("does not overwrite stats the provider supplied", () => {
    const data = parseResumeData({ stats: [{ label: "X", value: "9" }] });
    expect(enrichResume(data).stats).toEqual([{ label: "X", value: "9" }]);
  });

  test("derives label from the most recent position when missing", () => {
    const data = parseResumeData({ work: [{ company: "A", position: "Staff Engineer" }] });
    expect(enrichResume(data).basics.label).toBe("Staff Engineer");
  });

  test("estimateYears spans earliest start to now for current roles", () => {
    const years = estimateYears([{ company: "", position: "", startDate: "2015", endDate: "", summary: "", highlights: [] }]);
    expect(years).toBeGreaterThanOrEqual(new Date().getFullYear() - 2015);
  });
});

describe("normalizeOllamaHost", () => {
  test("adds scheme and port when missing", () => {
    expect(normalizeOllamaHost("localhost:11434")).toBe("http://localhost:11434");
    expect(normalizeOllamaHost("http://localhost")).toBe("http://localhost:11434");
  });

  test("rewrites unconnectable 0.0.0.0 to loopback", () => {
    expect(normalizeOllamaHost("0.0.0.0")).toBe("http://127.0.0.1:11434");
    expect(normalizeOllamaHost("0.0.0.0:11434")).toBe("http://127.0.0.1:11434");
  });

  test("falls back to default on empty/garbage", () => {
    expect(normalizeOllamaHost("")).toBe("http://127.0.0.1:11434");
    expect(normalizeOllamaHost(undefined)).toBe("http://127.0.0.1:11434");
  });
});
