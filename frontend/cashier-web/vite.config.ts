import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Vite React plugin'i kasiyer uygulamasında JSX/TSX derlemesini sağlar.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    // Cashier panel asset'leri /cashier altindan servis edilecek sekilde build edilir.
    base: env.VITE_APP_BASE_PATH || '/cashier/',
  };
});
