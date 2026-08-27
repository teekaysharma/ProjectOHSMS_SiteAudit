import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    open: false,
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'X-Frame-Options': 'SAMEORIGIN'
    }
  },
  preview: {
    host: '127.0.0.1',
    port: 4173,
    strictPort: true,
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'X-Frame-Options': 'SAMEORIGIN'
    }
  },
  // Relative base: works from a GitHub Pages subpath AND from file:// once the
  // single-file build lands (spec §11.3). Absolute '/' would break both.
  base: './',
  build: {
    outDir: 'dist',
    sourcemap: false
  }
});
