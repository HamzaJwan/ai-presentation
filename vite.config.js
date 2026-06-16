import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: false
  },
  define: {
    __PUBLIC_APP_URL__: JSON.stringify(process.env.VITE_PUBLIC_APP_URL || 'https://ai.juanspace.org')
  }
});
