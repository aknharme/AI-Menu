/** @type {import('tailwindcss').Config} */
export default {
  // Tailwind yalnızca bu uygulamanın HTML ve React dosyalarını tarar.
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};
