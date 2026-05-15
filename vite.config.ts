import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return;
          }
          const modulePath = id.split('node_modules/')[1];
          const segments = modulePath.split('/');
          const packageName = segments[0].startsWith('@') ? `${segments[0]}-${segments[1]}` : segments[0];
          return `vendor-${packageName.replace('@', '')}`;
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
