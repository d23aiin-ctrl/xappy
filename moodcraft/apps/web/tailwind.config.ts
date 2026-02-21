import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        // CereBro brand palette
        midnight: {
          50: '#eef0ff',
          100: '#dfe3ff',
          200: '#c6cbff',
          300: '#a3a8ff',
          400: '#8078ff',
          500: '#6b52fc',
          600: '#5c33f1',
          700: '#4e25d5',
          800: '#4020ab',
          900: '#1a0f3e',
          950: '#0d0820',
        },
        oracle: {
          50: '#fdf8ef',
          100: '#f9eed4',
          200: '#f2d9a7',
          300: '#e9bf71',
          400: '#e2a73f',
          500: '#d99525',
          600: '#c0751b',
          700: '#a05719',
          800: '#83451b',
          900: '#6c3a19',
          950: '#3d1c0a',
        },
        veil: {
          50: '#f3f1ff',
          100: '#ebe5ff',
          200: '#d9ceff',
          300: '#bda7ff',
          400: '#9d75ff',
          500: '#8040ff',
          600: '#7418ff',
          700: '#6508f0',
          800: '#5507c9',
          900: '#4608a4',
          950: '#290170',
        },
        // shadcn/ui compatible tokens
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fog-drift': {
          '0%, 100%': { opacity: '0.3', transform: 'translateX(-5%)' },
          '50%': { opacity: '0.6', transform: 'translateX(5%)' },
        },
        'breath-expand': {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.7' },
          '50%': { transform: 'scale(1.5)', opacity: '1' },
        },
        'oracle-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(217, 149, 37, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(217, 149, 37, 0.6)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fog-drift': 'fog-drift 8s ease-in-out infinite',
        'breath-expand': 'breath-expand 8s ease-in-out infinite',
        'oracle-pulse': 'oracle-pulse 3s ease-in-out infinite',
        shimmer: 'shimmer 2s linear infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
