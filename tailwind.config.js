/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#0B2545',
          navyDark: '#07182D',
          navyLight: '#133966',
          teal: '#0EA5A4',
          tealDark: '#0B8382',
          tealLight: '#2DD4BF',
          tealSoft: '#E6FFFA',
          emerald: '#10B981',
          blue: '#3B82F6',
          amber: '#F59E0B',
          coral: '#F97316',
          bg: '#F8FAFC',
          surface: '#FFFFFF',
          textPrimary: '#0F172A',
          textSecondary: '#475569',
          border: '#E2E8F0',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(11, 37, 69, 0.05), 0 1px 2px -1px rgba(11, 37, 69, 0.05)',
        'card': '0 4px 6px -1px rgba(11, 37, 69, 0.06), 0 2px 4px -2px rgba(11, 37, 69, 0.04)',
        'float': '0 10px 25px -5px rgba(11, 37, 69, 0.1), 0 8px 10px -6px rgba(11, 37, 69, 0.06)',
      }
    },
  },
  plugins: [],
}
