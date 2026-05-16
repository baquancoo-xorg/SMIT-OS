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
          if (/recharts|\/d3-|victory-vendor/.test(id)) return 'vendor-charts';
          if (/\/motion\/|framer-motion|motion-dom|motion-utils/.test(id)) return 'vendor-motion';
          if (/react-router/.test(id)) return 'vendor-router';
          if (/@tanstack/.test(id)) return 'vendor-tanstack';
          if (/@reduxjs|react-redux/.test(id)) return 'vendor-redux';
          if (/@headlessui|@radix-ui|lucide-react/.test(id)) return 'vendor-ui';
          if (/\/react-dom\/|\/react\/|scheduler|use-sync-external-store|react-is|prop-types|@babel\/runtime|tslib/.test(id)) return 'vendor-react';
          if (/zod|date-fns|es-toolkit|immer|decimal\.js/.test(id)) return 'vendor-utils';
          // Return undefined: let Vite auto-chunk remaining node_modules along
          // entry/dynamic-import boundaries. Explicit vendor-misc fallback was
          // causing `vendor-misc <-> vendor-react` circular chunk warning.
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
