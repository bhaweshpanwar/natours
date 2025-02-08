import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: '/public/js',
    rollupOptions: {
      input: '/public/js/index.js',
      output: {
        entryFileNames: 'bundle.js',
      },
    },
  },
});
