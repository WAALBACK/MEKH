import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { visualizer } from 'rollup-plugin-visualizer';

// Security: Define which environment variables are exposed to the client
// Only variables starting with VITE_ are exposed to the client
// Server-only secrets (without VITE_ prefix) will not be available in the browser
const clientEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_CLOUDINARY_CLOUD_NAME',
  'VITE_CLOUDINARY_UPLOAD_PRESET',
];

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    
    // Filter to only include allowed client-side env vars
    const filteredEnv: Record<string, string> = {};
    for (const key of clientEnvVars) {
      if (env[key]) {
        filteredEnv[key] = env[key];
      }
    }
    
    return {
      // Prevent exposing server-only env vars to client
      // This ensures variables without VITE_ prefix are not exposed
      envPrefix: 'VITE_', // Only expose VITE_ prefixed variables
      server: {
        port: 3000,
        host: '0.0.0.0',
        proxy: {
          '/api': {
            target: 'https://mekh.app',
            changeOrigin: true,
            secure: true,
          },
          '/uploads': {
            target: 'https://mekh.app',
            changeOrigin: true,
            secure: true,
          }
        }
      },
      plugins: [
        react(),
        tailwindcss(),
        ...(process.env.ANALYZE === 'true' ? [
          visualizer({
            open: true,
            gzipSize: true,
            brotliSize: true,
            filename: 'dist/bundle-analysis.html',
          })
        ] : []),
        // PWA plugin removed for native Capacitor Android build
      ],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      esbuild: {
        drop: mode === 'production' ? ['console', 'debugger'] : [],
        legalComments: 'none',
        target: 'es2015', // Better compatibility with older devices & react-snap crawler
      },
       build: {
         assetsInlineLimit: 0, // Prevents assets from being inlined as data URLs
         minify: 'esbuild',
         target: 'es2015', // Support older mobile browsers & react-snap crawler
         cssCodeSplit: true, // Split CSS for better caching
         sourcemap: false, // Disable sourcemaps in production for smaller files
         rollupOptions: {
          output: {
            entryFileNames: 'assets/[name]-[hash].js',
            chunkFileNames: 'assets/[name]-[hash].js',
            assetFileNames: (assetInfo) => {
              // Prevent hashing of favicon files — they need predictable URLs
              const name = assetInfo.name;
              if (name && (name.includes('favicon') || name === 'favicon.ico')) {
                return '[name].[ext]'; // No hash for favicons
              }
              return 'assets/[name]-[hash].[ext]';
            },
            manualChunks: (id) => {
              // Core React libraries — merge react-router WITH react
              if (
                id.includes('node_modules/react/') ||
                id.includes('node_modules/react-dom/') ||
                id.includes('node_modules/react-router')
              ) {
                return 'vendor-react';
              }
              // Auth chunk - separate Supabase and auth-related code
              if (id.includes('node_modules/@supabase/') || id.includes('src/lib/auth') || id.includes('src/hooks/useAuth')) {
                return 'vendor-auth';
              }
              // React Query - separate chunk for caching
              if (id.includes('node_modules/@tanstack/react-query')) {
                return 'vendor-query';
              }
              // UI components chunk - separate from pages
              if (id.includes('src/components/') && !id.includes('pages/')) {
                return 'ui-components';
              }
              // Leaflet (maps) - separate chunk
              if (id.includes('node_modules/leaflet')) {
                return 'vendor-leaflet';
              }
              // Quill editor - separate chunk
              if (id.includes('node_modules/quill') || id.includes('node_modules/react-quill')) {
                return 'vendor-quill';
              }
              // Cloudinary - separate chunk
              if (id.includes('node_modules/@cloudinary')) {
                return 'vendor-cloudinary';
              }
              // DOMPurify - only needed for blog/admin content rendering
              if (id.includes('node_modules/dompurify')) {
                return 'vendor-dompurify';
              }
              // browser-image-compression — heavy lib only needed during image uploads
              if (id.includes('node_modules/browser-image-compression')) {
                return 'vendor-image-compression';
              }
              // Capacitor plugins - separate chunk for native features
              if (id.includes('node_modules/@capacitor/')) {
                return 'vendor-capacitor';
              }
              // Utilities and libs - separate chunk
              if (id.includes('src/lib/') && !id.includes('src/lib/auth')) {
                return 'app-utils';
              }
              // Let Rollup handle page-level code splitting via dynamic imports
            },
          },
        },
      },
      base: '/', // Use absolute paths for root deployment - ensures correct asset paths
    };
});
