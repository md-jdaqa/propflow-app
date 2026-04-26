export type ThemeName =
  | "midnight-pro"
  | "arctic-glass"
  | "warm-amber"
  | "emerald-trust"
  | "slate-pro"
  | "soft-cream"
  | "purple-depth"
  | "steel-industrial"
  | "sunset-gradient"
  | "high-contrast";

export interface ThemeMeta {
  name: ThemeName;
  label: string;
  mode: "dark" | "light";
  description: string;
}

export const THEMES: ThemeMeta[] = [
  { name: "midnight-pro",     label: "Midnight Pro",          mode: "dark",  description: "Navy + electric blue, sharp cards" },
  { name: "arctic-glass",     label: "Arctic Glass",          mode: "dark",  description: "Dark slate + cyan, frosted glass" },
  { name: "warm-amber",       label: "Warm Amber",            mode: "dark",  description: "Dark brown + gold, premium finance feel" },
  { name: "emerald-trust",    label: "Emerald Trust",         mode: "dark",  description: "Dark green + emerald, real estate aesthetic" },
  { name: "slate-pro",        label: "Slate Professional",    mode: "light", description: "White + royal blue, clean SaaS" },
  { name: "soft-cream",       label: "Soft Cream",            mode: "light", description: "Warm off-white + terracotta, approachable" },
  { name: "purple-depth",     label: "Purple Depth",          mode: "dark",  description: "Deep purple + violet, modern consumer" },
  { name: "steel-industrial", label: "Steel Industrial",      mode: "dark",  description: "Near-black + steel blue, data-dense, no radius" },
  { name: "sunset-gradient",  label: "Sunset Gradient",       mode: "dark",  description: "Navy-to-teal sidebar + coral accent" },
  { name: "high-contrast",    label: "High Contrast",         mode: "dark",  description: "Pure black + white + yellow, WCAG AAA" },
];

export const DEFAULT_THEME: ThemeName = "midnight-pro";
export const DEFAULT_LIGHT_THEME: ThemeName = "slate-pro";
export const STORAGE_KEY = "propflow-theme";
