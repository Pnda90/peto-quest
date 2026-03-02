import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  server: {
    port: 3000,
    host: true
  },
  build: {
    target: 'esnext',
    assetsInlineLimit: 0,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        builder: resolve(__dirname, 'tools/asset-builder/index.html')
      },
      output: {
        manualChunks: {
          phaser: ['phaser']
        }
      }
    }
  }
});
