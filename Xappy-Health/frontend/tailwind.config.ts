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
        // XAPPY AI Brand Colors (Healthcare Teal Theme)
        xappy: {
          primary: "#0D9488",      // Healthcare teal
          secondary: "#0F766E",    // Healthcare dark teal
          accent: "#EA317E",       // Accent pink
          success: "#10B981",      // Green for success
          warning: "#F59E0B",      // Amber warning
          danger: "#EF4444",       // Red for errors
          dark: "#1A1D29",         // Dark charcoal
          light: "#F8F9FC",        // Light background
          lavender: "#F0FDFA",     // Light teal background
        },
        // Healthcare theme colors
        haptik: {
          blue: "#0D9488",
          navy: "#0F766E",
          pink: "#EA317E",
          cyan: "#06B6D4",
          purple: "#7C3AED",
          orange: "#F97316",
        },
        // Status colors
        status: {
          submitted: "#0D9488",
          acknowledged: "#8B5CF6",
          "under-review": "#F59E0B",
          closed: "#10B981",
          draft: "#6B7280",
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
