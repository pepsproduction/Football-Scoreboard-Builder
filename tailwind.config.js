/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#020817',
          900: '#0a0f1e',
          800: '#0d1526',
          700: '#111d35',
          600: '#162244',
          500: '#1a2a55',
        },
        accent: {
          blue: '#3b82f6',
          'blue-bright': '#60a5fa',
          cyan: '#06b6d4',
          indigo: '#6366f1',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'grid-pattern': "url(\"data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h20v20H0z' fill='none'/%3E%3Cpath d='M0 0h1v20H0zM19 0h1v20h-1zM0 0h20v1H0zM0 19h20v1H0z' fill='rgba(255,255,255,0.05)'/%3E%3C/svg%3E\")",
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-in': 'slideIn 0.25s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateY(-4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(59,130,246,0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(59,130,246,0.6)' },
        },
      },
      boxShadow: {
        'glow-blue': '0 0 20px rgba(59,130,246,0.4)',
        'glow-sm': '0 0 10px rgba(59,130,246,0.25)',
        'inner-dark': 'inset 0 2px 8px rgba(0,0,0,0.6)',
      },
    },
  },
  plugins: [],
}
