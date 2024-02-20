import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vitejs.dev/config
export default defineConfig(({ command }) => ({
  plugins: [react()],
  build: {
    sourcemap: command === 'serve',
    minify: command === 'serve' ? false : 'esbuild',
  },
}));
