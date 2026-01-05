// tailwind.config.js (for v3.4.17)
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: '#007B8A',
        secondary: '#004D56',
        accent: '#00BFA5',
        dark: '#0A0F14', // <--- This makes 'dark' available in @apply
        light: '#F8F9FA', // <--- This makes 'light' available in @apply
        gray: {
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        }
      },
    },
  },
  plugins: [],
}