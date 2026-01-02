import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // PRIMARY COLOR - Pastel Blue (used everywhere)
        'pastel-blue': '#E6F0FF',
        'pastel-blue-dark': '#C9DFFF',
        'pastel-blue-border': '#7BA3E0', // Darker, more vibrant blue for text/borders
        'pastel-blue-text': '#4A7BC7',   // Even darker for readable text
        
        // SECONDARY COLOR - Pastel Cream (backgrounds only)
        'pastel-cream': '#FFFDF5',
        
        // Only use these if absolutely necessary
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['var(--font-playfair)', 'Georgia', 'serif'],
      },
      letterSpacing: {
        tightest: '-0.01em',
      },
      borderWidth: {
        '3': '3px',
      }
    },
  },
  plugins: [],
} satisfies Config;
