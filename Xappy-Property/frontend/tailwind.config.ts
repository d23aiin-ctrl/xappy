import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Shadcn/UI colors (CSS variable based)
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // XAPPY Property Brand Colors (Royal Blue & Gold Theme)
        xappy: {
          primary: "#2563eb",      // Royal blue - trust, professionalism
          secondary: "#1d4ed8",    // Deep blue - depth
          accent: "#f59e0b",       // Amber gold - warmth, premium
          success: "#10B981",      // Emerald green for success
          warning: "#F59E0B",      // Amber warning
          danger: "#EF4444",       // Red for errors
          dark: "#1e3a8a",         // Dark blue
          light: "#eff6ff",        // Blue 50 - light background
          lavender: "#dbeafe",     // Blue 100 - subtle background
        },
        // Property Development theme colors
        haptik: {
          blue: "#2563eb",         // Royal blue - primary
          navy: "#1d4ed8",         // Deep blue - secondary
          pink: "#f59e0b",         // Amber gold accent
          cyan: "#0ea5e9",         // Sky blue
          purple: "#8b5cf6",       // Violet
          orange: "#f97316",       // Orange for warmth
        },
        // Status colors
        status: {
          submitted: "#3b82f6",    // Blue
          acknowledged: "#8B5CF6", // Purple
          "under-review": "#F59E0B", // Amber
          closed: "#10B981",       // Green
          draft: "#6B7280",        // Gray
        },
        // Severity colors
        severity: {
          low: "#10B981",
          medium: "#F59E0B",
          high: "#F97316",
          catastrophic: "#DC2626",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
