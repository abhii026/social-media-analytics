/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        app: {
          bg: 'var(--color-bg)',
          surface: 'var(--color-surface)',
          text: 'var(--color-text)',
          muted: 'var(--color-muted)',
          border: 'var(--color-border)',
          accent: 'var(--color-accent)',
          'accent-secondary': 'var(--color-accent-secondary)',
          positive: 'var(--color-positive)',
          negative: 'var(--color-negative)',
          warning: 'var(--color-warning)',
        },
      },
    },
  },
  plugins: [],
}
