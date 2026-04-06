/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#D4AF37', dark: '#B8961E', light: '#E8C547' },
        surface: { DEFAULT: '#111827', card: '#1F2937', border: '#374151', hover: '#283141' },
      },
      fontFamily: { sans: ['Inter', 'sans-serif'], display: ['"Cormorant Garamond"', 'serif'] },
    }
  },
  plugins: []
}
