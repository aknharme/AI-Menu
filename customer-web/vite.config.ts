import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite React plugin'i JSX/TSX dönüşümü ve hızlı geliştirme deneyimini sağlar.
export default defineConfig({
  plugins: [react()],
});
