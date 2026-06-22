import { describe, expect, test } from "vitest";
import { MockProvider } from "@/lib/llm/mock";

const SAMPLE = `Jane Doe
Senior Frontend Engineer
jane.doe@example.com | +1 415 555 0199 | https://janedoe.dev
San Francisco

Summary
Frontend engineer with 9 years of experience building accessible web apps.

Experience
2020 - present  Stripe — Staff Frontend Engineer
- Led migration of the dashboard to React and TypeScript.

2015 - 2020  Airbnb — Frontend Engineer
- Shipped the host onboarding flow.

Skills
JavaScript, TypeScript, React, Next.js, GraphQL

Education
2011 - 2015  Stanford University — B.S. Computer Science
`;

describe("MockProvider (rule-based fallback)", () => {
  test("extracts basics, contact and city", async () => {
    const r = await new MockProvider().extractResume(SAMPLE, { language: "en" });
    expect(r.basics.name).toBe("Jane Doe");
    expect(r.basics.label).toContain("Frontend Engineer");
    expect(r.basics.email).toBe("jane.doe@example.com");
    expect(r.basics.location.city).toBe("San Francisco");
  });

  test("parses work entries with company, position and dates", async () => {
    const r = await new MockProvider().extractResume(SAMPLE, { language: "en" });
    expect(r.work.length).toBeGreaterThanOrEqual(2);
    expect(r.work[0].company).toBe("Stripe");
    expect(r.work[0].position).toContain("Staff");
    expect(r.work[0].endDate).toBe(""); // present
    expect(r.work[1].endDate).toBe("2020");
  });

  test("does not leak section headers into skills", async () => {
    const r = await new MockProvider().extractResume(SAMPLE, { language: "en" });
    const names = r.skills.map((s) => s.name);
    expect(names).toContain("JavaScript");
    expect(names).not.toContain("Education");
  });

  test("detects Chinese and localizes stat labels", async () => {
    const zh = `张伟\n高级后端工程师\nzhangwei@example.com\n北京\n专业技能\nJava、Go、Python`;
    const r = await new MockProvider().extractResume(zh, { language: "auto" });
    expect(r.meta.language).toBe("zh");
    expect(r.stats[0].label).toBe("工作年限");
  });
});
