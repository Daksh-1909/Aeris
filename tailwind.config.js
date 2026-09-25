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
          deepBlack: '#050505',
          warmWhite: '#F5F3EF',
          pureWhite: '#FFFFFF',
          mutedGray: '#8A8A83',
          sand: '#D8D3C8',
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
