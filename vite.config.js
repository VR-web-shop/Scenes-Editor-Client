import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5175,
  },
  build: {
    outDir: 'dist', // Output directory for the build
    assetsDir: './', // Relative path for assets
  },
})
