import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // IMPORTANT: This 'base' path must exactly match your GitHub repository name.
  // Based on your console output (abdo754.github.io/Car-Parts-Search-Engine/),
  // your repository name is 'Car-Parts-Search-Engine'.
  base: '/Car-Parts-Search-Engine/',
});
