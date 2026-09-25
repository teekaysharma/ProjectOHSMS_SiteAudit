import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Spec §11.3: module scripts are unreliable from file://, so the inlined bundle must run
// as a classic script. Vite always tags the entry script type="module" and puts it in
// <head>, where a classic script would run before <main id="app"> exists. This plugin
// runs after vite-plugin-singlefile and moves the inlined code to the end of <body> as a
// plain <script>.
function classicScript() {
  return {
    name: 'classic-script',
    enforce: 'post',
    generateBundle(_options, bundle) {
      for (const file of Object.values(bundle)) {
        if (file.type !== 'asset' || !file.fileName.endsWith('.html')) continue;
        const html = String(file.source);
        const match = html.match(/<script type="module"[^>]*>([\s\S]*?)<\/script>/);
        if (!match) this.error(`classic-script: no inlined module script in ${file.fileName}`);
        file.source = html
          .replace(match[0], '')
          .replace('</body>', `<script>${match[1]}</script>\n</body>`);
      }
    }
  };
}

export default defineConfig({
  root: 'app',
  base: './',
  // removeViteModuleLoader stays off: with format 'iife' it strips the whole bundle.
  plugins: [viteSingleFile(), classicScript()],
  build: {
    outDir: '../dist-app',
    emptyOutDir: true,
    rollupOptions: {
      output: { format: 'iife', inlineDynamicImports: true }
    }
  }
});
