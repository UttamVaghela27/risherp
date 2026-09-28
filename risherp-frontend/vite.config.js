import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true, // Auto-open browser on dev server start
  },
  resolve: {
    alias: {
      '@': '/src', // Allows imports like: import Sidebar from '@/layouts/Sidebar'
    },
  },
});
