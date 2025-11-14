import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/widget.js',
      name: 'AccessibilityWidget',
      formats: ['iife'],
      fileName: () => 'widget.bundle.js'
    },
    rollupOptions: {
      output: {
        assetFileNames: assetInfo => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'widget.css';
          }
          return 'assets/[name][extname]';
        }
      }
    }
  }
});
