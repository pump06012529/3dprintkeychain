import { defineConfig } from 'vite';

export default defineConfig(({ command }) => ({
  base: command === 'serve' ? '/Image-Keychain/' : './',
  server: { port: 5178, strictPort: true },
}));
