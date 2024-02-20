import { defineConfig } from 'vite';

// https://vitejs.dev/config
export default defineConfig(({ command }) => ({
  build: {
    outDir: '.vite/preload',
    sourcemap: command === 'serve',
    minify: command === 'serve' ? false : 'esbuild',
  },
}));
