import { defineConfig } from 'vite';

export default defineConfig(({ command }) => ({
  base: command === 'serve' ? '/' : '/3dprintkeychain/',
  server: {
    proxy: {
      '/Clicker-Generator': {
        target: 'http://localhost:5175',
        changeOrigin: true,
      },
      '/SVG-keycap-generator': {
        target: 'http://localhost:5179',
        changeOrigin: true,
      },
      '/Name-Keychain': {
        target: 'http://localhost:5176',
        changeOrigin: true,
      },
    },
    port: 5174,
    strictPort: true,
  },
}));
