import { TableauDashboard } from "@/components/templates/TableauDashboard";
import { MinimalTimeline } from "@/components/templates/MinimalTimeline";
import type { TemplateMeta } from "@/components/templates/types";

/** Template registry — add a new template here, no other code changes needed. */
export const TEMPLATES: TemplateMeta[] = [
  {
    id: "dashboard",
    name: "Tableau Dashboard",
    description: "甘特时间轴 + 气泡图 + 点阵技能矩阵 · 全宽横向(推荐)",
    accent: "#4FB0A5",
    Component: TableauDashboard,
  },
  {
    id: "minimal",
    name: "Minimal Timeline",
    description: "清爽单栏 · 适合打印",
    accent: "#2ca02c",
    Component: MinimalTimeline,
  },
];

export const DEFAULT_TEMPLATE_ID = "dashboard";

export function getTemplate(id: string): TemplateMeta {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];
}
