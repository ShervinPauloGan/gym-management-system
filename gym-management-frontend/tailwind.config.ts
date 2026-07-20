import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: { sans: ["Geist", "system-ui", "sans-serif"] },
      colors: {
        surface: {
          DEFAULT: "#F8F9FA", dim: "#E5E7EB", bright: "#FFFFFF",
          container: { lowest: "#FFFFFF", low: "#F3F4F6", DEFAULT: "#F3F4F6", high: "#E5E7EB", highest: "#D1D5DB" },
        },
        primary: { DEFAULT: "#000000", foreground: "#FFFFFF" },
        muted: { DEFAULT: "#6B7280", foreground: "#9CA3AF" },
        border: { DEFAULT: "#E5E7EB" },
        error: { DEFAULT: "#DC2626" },
      },
      borderRadius: { sm: "0.25rem", DEFAULT: "0.5rem", md: "0.75rem", lg: "1rem", xl: "1.5rem", full: "9999px" },
      spacing: { gutter: "24px", "page-margin": "32px" },
      fontSize: {
        "metric-lg": ["36px", { lineHeight: "44px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "metric-md": ["24px", { lineHeight: "32px", letterSpacing: "-0.01em", fontWeight: "700" }],
      },
    },
  },
  plugins: [],
} satisfies Config;
