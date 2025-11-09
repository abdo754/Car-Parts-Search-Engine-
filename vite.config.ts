import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // IMPORTANT: This 'base' path must exactly match your GitHub repository name.
  // The repository name appears to include a trailing dash (Car-Parts-Search-Engine-),
  // so the base must match exactly. Use '/Car-Parts-Search-Engine-/' when deploying
  // to https://abdo754.github.io/Car-Parts-Search-Engine-/
  base: '/Car-Parts-Search-Engine-/',
});
