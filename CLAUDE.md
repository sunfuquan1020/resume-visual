# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Resume Visualizer (可视化简历): upload a resume (PDF/DOCX/TXT) → extract structured data with an LLM → render it as a "Tableau-style" infographic resume. Multiple templates, in-browser editing, PNG/PDF export, bilingual (中文/English). Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS **v4**.

## Commands

```bash
npm run dev            # dev server (Turbopack) at http://localhost:3000
npm run build          # production build — also runs full TypeScript type-checking
npm start              # serve the production build
npm test               # vitest run (all *.test.ts under src/)
npx vitest run src/lib/llm/mock.test.ts          # a single test file
npx vitest run -t "fills stats when the provider omitted"   # a single test by name
npx tsc --noEmit       # type-check only (faster than a full build)
```

Config lives in `.env.local` (copy from `.env.example`). With no keys set, the app still works end-to-end via the rule-based `mock` extractor.

### Gotcha: never run `next build` while `next dev` is running
Both share the `.next/` directory; building clobbers a running dev server's chunks and produces `__webpack_modules__[moduleId] is not a function` at runtime. To verify production behavior without disturbing dev, build then `npx next start -p <other-port>`. After any clobber: `rm -rf .next && npm run dev`.

## Architecture — the single data contract

Everything flows through **`ResumeData`** (`src/lib/schema/resume.ts`), a Zod schema. The hard rule: **data and presentation are separate** — extractors only produce `ResumeData`, templates only consume it. Adding a template never touches extraction; changing extraction never touches templates.

Pipeline:
```
upload → src/lib/extract/text.ts        (PDF via unpdf, DOCX via mammoth, plain text)
       → LLMProvider.extractResume()     (provider-agnostic, returns ResumeData)
       → enrichResume()                  (fills omitted stats/label — src/lib/resume/enrich.ts)
       → Zod-validated ResumeData
       → Zustand store (persisted)        (src/store/resumeStore.ts)
       → template renders from ResumeData (src/components/templates/*)
       → PNG/PDF export, client-side      (src/components/editor/ExportButtons.tsx)
```
The server boundary is the single route `src/app/api/extract/route.ts` (runtime = nodejs). LLM keys are used server-side only and never reach the client.

### LLM provider layer (`src/lib/llm/`)
- `provider.ts` — the `LLMProvider` interface (`extractResume(text, opts) → ResumeData`) plus `parseJsonLoose`.
- `prompt.ts` — the shared system/user prompt **and** `RESUME_JSON_SCHEMA`, reused by every provider so output is provider-agnostic.
- `anthropic.ts` (tool-use forces the schema), `openai.ts` (OpenAI-compatible `json_schema`; also serves any compatible gateway), `ollama.ts` (native `/api/chat` structured outputs, fully offline), `mock.ts` (rule-based regex fallback).
- `index.ts` — `getProvider()` resolves the active provider from `LLM_PROVIDER` env and **falls back to `mock` when credentials are missing**. The extract route additionally falls back to `mock` if a configured provider throws at runtime.

When adding/altering a provider, change `prompt.ts`'s schema in **one** place; don't fork per-provider schemas. `OllamaProvider`'s `normalizeOllamaHost` tolerates `OLLAMA_HOST` written as `0.0.0.0`, missing scheme, or missing port.

### Templates & viz (`src/components/`)
- `templates/registry.ts` is the **only** place to register a template (`TEMPLATES[]` + `DEFAULT_TEMPLATE_ID`); the editor and store read from it. Default is `dashboard` (`TableauDashboard.tsx`), which mirrors public Tableau resumes.
- `templates/types.ts` holds `TemplateProps`, `TemplateMeta`, and the `t(lang)` i18n helper — add localized section titles to its dict.
- `viz/` are dependency-free chart primitives (hand-rolled SVG/CSS, **no chart library**): `GanttTimeline`, `PackedBubbles` (greedy spiral packing), `SkillDotMatrix`, `SkillRadar`, `SkillBar`, `Gauge`, `StatCard`. Shared colors + `parseYear` live in `viz/palette.ts`.

Because export uses `html-to-image` on the live DOM node, viz must be plain SVG/HTML (no `<foreignObject>`), and SVG attributes must be valid React/DOM (`strokeLinecap`, not `strokelinecap`; use `style={{height:'auto'}}` rather than `height="auto"`).

## Tailwind v4 notes
- PostCSS plugin is `@tailwindcss/postcss` (see `postcss.config.mjs`); `tailwind.config.ts` is legacy and **not read**.
- Theme is CSS-first in `src/app/globals.css` via `@theme` (the custom `tab-*` colors and `font-sans` are defined there). A base layer restores v3's light-gray default border color.

## Conventions
- Zod: nested object defaults use `.prefault({})` (not `.default({})`) so empty input cascades inner field defaults — required by Zod v4.
- Immutable updates throughout (store `patch`, template props); `parseResumeData()` / `emptyResume()` are the entry points for untrusted/partial data.
