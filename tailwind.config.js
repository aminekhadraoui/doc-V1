/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f7fa',
          100: '#b3e6f2',
          200: '#80d5ea',
          300: '#4cc4e2',
          400: '#26b6db',
          500: '#0891b2', // primary
          600: '#077999',
          700: '#056180',
          800: '#044a66',
          900: '#02334d',
        },
        accent: {
          50: '#e6f7f6',
          100: '#b3e8e5',
          200: '#80d9d4',
          300: '#4dcac3',
          400: '#26beb6',
          500: '#0d9488', // accent
          600: '#0b7d73',
          700: '#08665e',
          800: '#064e49',
          900: '#033734',
        },
        neutral: {
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
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}