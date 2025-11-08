import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // IMPORTANT: Replace 'YOUR_REPOSITORY_NAME' with the actual name of your GitHub repository.
  // For example, if your repository is named 'car-parts-search-engine', it should be base: '/car-parts-search-engine/'
  base: '/YOUR_REPOSITORY_NAME/', 
});
