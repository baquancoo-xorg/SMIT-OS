import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    visualizer({
      filename: 'dist/stats.html',
      gzipSize: true,
      brotliSize: true,
      template: 'treemap',
      open: false,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.')
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('recharts') || id.includes('/d3-') || id.includes('victory-vendor')) return 'vendor-charts';
          if (id.includes('react-dom') || id.includes('/react/') || id.includes('scheduler')) return 'vendor-react';
          if (id.includes('react-router')) return 'vendor-router';
          if (id.includes('@headlessui') || id.includes('@radix-ui') || id.includes('lucide-react')) return 'vendor-ui';
          if (id.includes('framer-motion') || id.includes('motion-dom') || id.includes('motion-utils')) return 'vendor-motion';
          if (id.includes('@tanstack')) return 'vendor-tanstack';
          if (id.includes('zod') || id.includes('date-fns') || id.includes('es-toolkit') || id.includes('immer') || id.includes('decimal.js')) return 'vendor-utils';
          if (id.includes('@reduxjs') || id.includes('react-redux')) return 'vendor-redux';
          return 'vendor-misc';
        }
      }
    }
  },
  server: {
    hmr: process.env.DISABLE_HMR === 'true' ? false : {
      protocol: 'wss',
      clientPort: 443
    },
    allowedHosts: ['qdashboard.smitbox.com']
  }
});
