import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'icons-vendor': ['lucide-react'],
          'questions-data': ['./src/data/questionsBank.ts'],
          'curriculum-data': ['./src/data/modulesData.ts', './src/data/signsAndGlossary.ts'],
        },
      },
    },
  },
});
