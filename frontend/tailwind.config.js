/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#0b0f14',
          panel: '#0f1720',
          accent: '#00e5ff',
          accent2: '#7c3aed',
          danger: '#ff3b3b',
          success: '#22c55e',
        }
      },
      boxShadow: {
        neon: '0 0 10px rgba(0,229,255,0.6), 0 0 20px rgba(124,58,237,0.4)'
      }
    },
  },
  plugins: [],
}
