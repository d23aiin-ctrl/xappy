import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Rubik', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        primary: {
          blue: '#6366f1',
          light: '#818cf8',
          dark: '#4f46e5',
        },
        accent: {
          green: '#22c55e',
          'green-light': '#4ade80',
          teal: '#14b8a6',
          orange: '#f97316',
          purple: '#a855f7',
          pink: '#ec4899',
          cyan: '#0891b2',
          red: '#dc2626',
        },
        text: {
          dark: '#1a1a2e',
          muted: '#6c757d',
        },
        bg: {
          light: '#f8fafc',
          white: '#ffffff',
        },
        border: {
          DEFAULT: '#e2e8f0',
        },
      },
      boxShadow: {
        card: '0 4px 20px rgba(0,0,0,0.06)',
        'card-hover': '0 12px 40px rgba(0,0,0,0.12)',
        'primary-glow': '0 4px 14px rgba(99, 102, 241, 0.35)',
        'primary-glow-hover': '0 6px 20px rgba(99, 102, 241, 0.45)',
        'green-glow': '0 8px 20px rgba(34, 197, 94, 0.25)',
        'purple-glow': '0 8px 20px rgba(168, 85, 247, 0.25)',
        'orange-glow': '0 8px 20px rgba(249, 115, 22, 0.25)',
        'cyan-glow': '0 8px 20px rgba(8, 145, 178, 0.25)',
        'pink-glow': '0 8px 20px rgba(236, 72, 153, 0.25)',
        'blue-glow': '0 8px 20px rgba(59, 130, 246, 0.25)',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '20px',
        '4xl': '28px',
      },
      screens: {
        xs: '576px',
        sm: '768px',
        md: '992px',
        lg: '1200px',
        xl: '1400px',
        // Max-width screens for responsive design
        'max-xs': { max: '575px' },
        'max-sm': { max: '767px' },
        'max-md': { max: '991px' },
        'max-lg': { max: '1199px' },
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.8s ease-out',
        'fade-in-down': 'fadeInDown 0.8s ease-out',
        'fade-in-left': 'fadeInLeft 0.8s ease-out',
        'fade-in-right': 'fadeInRight 0.8s ease-out',
        float: 'float 6s ease-in-out infinite',
        shimmer: 'shimmer 1.5s infinite',
        'gradient-shift': 'gradientShift 5s ease infinite',
        pulse: 'pulse 2s ease-in-out infinite',
        'scale-in': 'scaleIn 0.5s ease-out',
        'accordion-down': 'accordionDown 0.3s ease-out',
        'accordion-up': 'accordionUp 0.3s ease-out',
      },
      keyframes: {
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(40px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          from: { opacity: '0', transform: 'translateY(-40px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInLeft: {
          from: { opacity: '0', transform: 'translateX(-40px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        fadeInRight: {
          from: { opacity: '0', transform: 'translateX(40px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        gradientShift: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        pulse: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.9)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        accordionDown: {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        accordionUp: {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        'gradient-hero': 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
        'gradient-stats': 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
        'gradient-footer': 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%)',
        'gradient-green': 'linear-gradient(135deg, #22c55e 0%, #4ade80 100%)',
        'gradient-purple': 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
        'gradient-orange': 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)',
        'gradient-cyan': 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
        'gradient-red': 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
        'gradient-whatsapp': 'linear-gradient(135deg, #128C7E 0%, #25d366 100%)',
        'gradient-whatsapp-commerce': 'linear-gradient(135deg, #075e54 0%, #25d366 100%)',
        'gradient-pink': 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
        'gradient-teal': 'linear-gradient(135deg, #14b8a6 0%, #2dd4bf 100%)',
        'gradient-amber': 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
        'gradient-blue': 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
      },
      transitionDuration: {
        '400': '400ms',
      },
    },
  },
  plugins: [],
};

export default config;
