/** Soft Tableau-style palette shared across the dashboard charts. */

export const CATEGORY_COLORS: Record<string, string> = {
  education: "#4FB0A5", // teal
  internship: "#E8A33D", // orange
  work: "#D9685B", // coral red
  project: "#7E9BD0", // blue
  default: "#9AA7B5",
};

/** Muted categorical series (Tableau 20-ish) for bubbles / tiles. */
export const SERIES = [
  "#6BA3BE",
  "#E8A33D",
  "#7BBF8F",
  "#D98B8B",
  "#B3A2C7",
  "#C9B97E",
  "#8FB0A3",
  "#D6A55B",
  "#9BBCD1",
  "#BF8F6F",
];

export function seriesColor(i: number): string {
  return SERIES[i % SERIES.length];
}

/** Parse the first 4-digit year (19xx/20xx) out of a free-form date string. */
export function parseYear(s: string): number | null {
  const m = (s || "").match(/(19|20)\d{2}/);
  return m ? Number(m[0]) : null;
}
