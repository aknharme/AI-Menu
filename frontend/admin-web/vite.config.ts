import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite React plugin'i admin uygulamasında TSX desteğini etkinleştirir.
export default defineConfig({
  plugins: [react()],
});
