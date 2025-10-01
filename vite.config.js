import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/JeroenandPaws/',
  plugins: [react()],
  server: {
    open: true
  }
});
