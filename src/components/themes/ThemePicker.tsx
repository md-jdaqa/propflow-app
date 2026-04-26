"use client";
import { useEffect, useState } from "react";
import { THEMES, STORAGE_KEY, DEFAULT_THEME, type ThemeName } from "./themes";

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeName>(DEFAULT_THEME);

  useEffect(() => {
    const current = (document.documentElement.getAttribute("data-theme") as ThemeName) || DEFAULT_THEME;
    setThemeState(current);
  }, []);

  const setTheme = (next: ThemeName) => {
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem(STORAGE_KEY, next); } catch {}
    setThemeState(next);
  };

  return { theme, setTheme };
}

export function ThemePicker() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" data-testid="theme-picker">
      {THEMES.map((t) => {
        const active = theme === t.name;
        return (
          <button
            key={t.name}
            type="button"
            onClick={() => setTheme(t.name)}
            data-testid={`theme-${t.name}`}
            aria-pressed={active}
            className={
              "pf-card text-left min-h-touch flex flex-col gap-1 transition " +
              (active ? "ring-2 ring-primary" : "hover:opacity-90")
            }
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-heading">{t.label}</span>
              <span className="pf-badge bg-primary/10 text-primary">{t.mode}</span>
            </div>
            <span className="text-sm text-muted">{t.description}</span>
          </button>
        );
      })}
    </div>
  );
}
