import { TableauDashboard } from "@/components/templates/TableauDashboard";
import { InfographicTableau } from "@/components/templates/InfographicTableau";
import { MinimalTimeline } from "@/components/templates/MinimalTimeline";
import { DarkBento } from "@/components/templates/DarkBento";
import type { TemplateMeta } from "@/components/templates/types";

/** Template registry — add a new template here, no other code changes needed. */
export const TEMPLATES: TemplateMeta[] = [
  {
    id: "dashboard",
    name: "Tableau Dashboard",
    description: "甘特时间轴 + 气泡图 + 点阵技能矩阵(推荐)",
    accent: "#4FB0A5",
    Component: TableauDashboard,
  },
  {
    id: "tableau",
    name: "Tableau Infographic",
    description: "Dark sidebar + KPI cards, radar & timeline (类 Tableau)",
    accent: "#1f77b4",
    Component: InfographicTableau,
  },
  {
    id: "minimal",
    name: "Minimal Timeline",
    description: "Clean single-column, print-friendly",
    accent: "#2ca02c",
    Component: MinimalTimeline,
  },
  {
    id: "bento",
    name: "Dark Bento",
    description: "Modern dark bento-grid cards",
    accent: "#17becf",
    Component: DarkBento,
  },
];

export const DEFAULT_TEMPLATE_ID = "dashboard";

export function getTemplate(id: string): TemplateMeta {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];
}
