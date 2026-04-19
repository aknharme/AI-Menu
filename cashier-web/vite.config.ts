import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite React plugin'i kasiyer uygulamasında JSX/TSX derlemesini sağlar.
export default defineConfig({
  plugins: [react()],
});
