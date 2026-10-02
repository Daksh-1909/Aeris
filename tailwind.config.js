/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        aeris: {
          'sky-950': 'var(--sky-950)',
          'sky-900': 'var(--sky-900)',
          'sky-800': 'var(--sky-800)',
          'sky-600': 'var(--sky-600)',
          'mist-400': 'var(--mist-400)',
          'cloud-50': 'var(--cloud-50)',
          'azure-300': 'var(--azure-300)',
          'sage-300': 'var(--sage-300)',
          'gold-300': 'var(--gold-300)',
          'rose-300': 'var(--rose-300)',
        }
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'serif'],
        ui: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
