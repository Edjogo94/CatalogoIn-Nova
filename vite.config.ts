
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Esto reemplaza process.env.API_KEY en el código por su valor real durante el build
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || "")
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
});
