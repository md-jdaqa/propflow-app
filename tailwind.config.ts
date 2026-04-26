import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: ["selector", '[data-theme]'],
  theme: {
    extend: {
      colors: {
        bg:        "var(--bg)",
        surface:   "var(--surface)",
        border:    "var(--border)",
        primary:   "var(--primary)",
        secondary: "var(--secondary)",
        success:   "var(--success)",
        warning:   "var(--warning)",
        danger:    "var(--danger)",
        body:      "var(--body)",
        muted:     "var(--muted)",
        heading:   "var(--heading)",
      },
      borderRadius: {
        DEFAULT: "var(--radius)",
        lg:      "var(--radius-lg)",
      },
      minHeight: {
        touch: "44px",
      },
      minWidth: {
        touch: "44px",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui"],
        mono: ["var(--font-mono)", "ui-monospace", "Menlo"],
      },
    },
  },
  plugins: [],
};
export default config;
