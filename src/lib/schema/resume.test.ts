import { describe, expect, test } from "vitest";
import { emptyResume, parseResumeData } from "@/lib/schema/resume";

describe("ResumeData schema", () => {
  test("emptyResume returns a valid, fully-defaulted object", () => {
    const r = emptyResume();
    expect(r.basics.name).toBe("");
    expect(r.work).toEqual([]);
    expect(r.meta.language).toBe("en");
  });

  test("parseResumeData fills missing fields with defaults", () => {
    const r = parseResumeData({ basics: { name: "Ada" }, skills: [{ name: "Rust" }] });
    expect(r.basics.name).toBe("Ada");
    expect(r.basics.email).toBe(""); // defaulted
    expect(r.skills[0].level).toBe(60); // default proficiency
  });

  test("clamps skill level into 0-100", () => {
    expect(() => parseResumeData({ skills: [{ name: "X", level: 150 }] })).toThrow();
  });

  test("accepts unknown input by treating it as empty", () => {
    expect(parseResumeData(null).work).toEqual([]);
  });
});
