import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";
import { apiChatDevPlugin } from "./scripts/vite-api-chat-plugin.mjs";

export default defineConfig({
  plugins: [
    react(),
    apiChatDevPlugin(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicons/favicon.svg", "favicons/apple-touch-icon.svg"],
      manifest: false,
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,svg,woff2}"],
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
    }),
  ],
  base: "/",
  publicDir: "public",
  css: {
    preprocessorOptions: {
      scss: {
        api: "modern-compiler",
      },
    },
    // Enable CSS code splitting
    devSourcemap: false,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    strictPort: false,
    open: true,
    hmr: process.env.VITE_HMR_CLIENT_PORT
      ? { clientPort: Number(process.env.VITE_HMR_CLIENT_PORT) }
      : undefined,
  },
  build: {
    outDir: "dist",
    sourcemap: false, // Disable sourcemaps in production for smaller bundle
    minify: "terser",
    cssCodeSplit: true, // Split CSS into chunks
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ["console.log", "console.info", "console.debug"],
      },
      mangle: {
        safari10: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom"],
          "vendor-router": ["react-router-dom"],
          "vendor-motion": ["framer-motion"],
          "vendor-lenis": ["lenis"],
          "vendor-icons": ["react-icons"],
          "vendor-analytics": ["@vercel/analytics"],
        },
      },
    },
    chunkSizeWarningLimit: 500, // Lower threshold to encourage smaller chunks
    // Reduce target for better tree-shaking
    target: "esnext",
    // Enable module preload polyfill
    modulePreload: {
      polyfill: true,
    },
    // Speed up builds by skipping compressed size reporting
    reportCompressedSize: false,
  },
  // Optimize deps
  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom", "framer-motion", "lenis"],
  },
});
