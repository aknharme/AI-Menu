/** @type {import('tailwindcss').Config} */
export default {
  // Tailwind kullanılmayan class'ları production build sırasında temizlemek için bu dosyaları tarar.
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};
