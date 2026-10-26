import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        /** LEEK brand — dark green theme */
        leek: {
          950: "#064e3b",
          800: "#065f46",
          600: "#047857",
          50: "#ecfdf5",
        },
        page: "#f9fafb",
        ink: "#111827",
        muted: "#6b7280",
        cta: "#facc15",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        leek: "0 4px 14px -2px rgba(6, 78, 59, 0.15), 0 2px 6px -2px rgba(6, 78, 59, 0.08)",
      },
    },
  },
  plugins: [],
};
export default config;
