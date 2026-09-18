import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === 'pages' ? (process.env.PAGES_BASE_PATH ?? '/ZANSHITSU/') : '/',
  server: { port: 5187, strictPort: true },
}));
