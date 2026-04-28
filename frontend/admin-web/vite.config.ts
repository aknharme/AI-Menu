import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Vite React plugin'i admin uygulamasında TSX desteğini etkinleştirir.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    // Admin panel asset'leri /admin altindan servis edilecek sekilde build edilir.
    base: env.VITE_APP_BASE_PATH || '/admin/',
  };
});
