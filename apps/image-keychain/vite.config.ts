import { defineConfig } from 'vite';

export default defineConfig(({ command }) => ({
  base: command === 'serve' ? '/Image-Keychain/' : './',
  server: { port: 5178, strictPort: true },
  build: {
    sourcemap: false,
    target: 'es2022',
  },
  optimizeDeps: {
    exclude: ['manifold-3d'],
  },
}));
