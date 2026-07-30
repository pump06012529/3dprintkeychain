import { defineConfig } from 'vite';

export default defineConfig(({ command }) => ({
  base: command === 'serve' ? '/Name-Keychain/' : './',
  server: { port: 5176, strictPort: true },
}));
