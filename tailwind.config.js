/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'cx-bg': '#0d1117',
        'cx-surface': '#161b22',
        'cx-border': '#30363d',
        'cx-green': '#3fb950',
        'cx-blue': '#388bfd',
        'cx-red': '#f85149',
        'cx-yellow': '#d29922',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

