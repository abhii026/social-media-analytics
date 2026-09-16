/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'sans-serif'],
        display: ['"Sora"', 'sans-serif'],
      },
      colors: {
        dark: {
          950: '#0a0b10',
          900: '#0f1118',
          850: '#131520',
          800: '#181b28',
          700: '#23273a',
        },
        panel: {
          DEFAULT: '#11131c',
          hover: '#171a27',
          border: 'rgba(148, 163, 184, 0.1)',
          subtle: 'rgba(148, 163, 184, 0.05)',
        },
        brand: {
          DEFAULT: '#8b5cf6',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
        },
        accent: {
          cyan: '#22d3ee',
          purple: '#a78bfa',
          emerald: '#34d399',
          rose: '#fb7185',
          amber: '#fbbf24',
          blue: '#60a5fa',
        },
      },
      boxShadow: {
        'panel': '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
        'glow-cyan': '0 0 20px -3px rgba(34, 211, 238, 0.25)',
        'glow-purple': '0 0 20px -3px rgba(167, 139, 250, 0.25)',
      },
      borderRadius: {
        'panel': '14px',
      },
    },
  },
  plugins: [],
}
