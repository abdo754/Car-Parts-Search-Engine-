import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // IMPORTANT: Must match your exact GitHub repository name (including dash)
  base: '/Car-Parts-Search-Engine-/', 
});
