import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/Football-Scoreboard-Builder/',
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) return 'react';
          if (id.includes('node_modules/konva/') || id.includes('node_modules/react-konva/')) return 'konva';
          if (id.includes('node_modules/react-colorful/') || id.includes('node_modules/lucide-react/')) return 'controls';
          return undefined;
        },
      },
    },
  },
})
