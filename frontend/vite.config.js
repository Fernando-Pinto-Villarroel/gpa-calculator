const { defineConfig } = require("vite");
const react = require("@vitejs/plugin-react");
const { VitePWA } = require("vite-plugin-pwa");
const { resolve } = require("path");

module.exports = defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "logo192.png", "logo512.png"],
      manifest: {
        name: "Jala University GPA Calculator",
        short_name: "Jala GPA Calculator",
        description:
          "Track your academic progress and calculate your GPA with ease.",
        theme_color: "#2563eb",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "/favicon.ico",
            sizes: "64x64 32x32 24x24 16x16",
            type: "image/x-icon",
          },
          {
            src: "/logo192.png",
            type: "image/png",
            sizes: "192x192",
          },
          {
            src: "/logo512.png",
            type: "image/png",
            sizes: "512x512",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
            },
          },
        ],
      },
    }),
  ],

  base: "/",
  publicDir: "public",

  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
      "@components": resolve(__dirname, "src/components"),
      "@pages": resolve(__dirname, "src/pages"),
      "@contexts": resolve(__dirname, "src/contexts"),
      "@hooks": resolve(__dirname, "src/hooks"),
      "@services": resolve(__dirname, "src/services"),
      "@utils": resolve(__dirname, "src/utils"),
      "@data": resolve(__dirname, "src/data"),
    },
  },

  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: false,
    minify: "terser",
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          router: ["react-router-dom"],
          motion: ["framer-motion"],
          icons: ["lucide-react"],
        },
      },
    },
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },

  server: {
    port: 3000,
    host: true,
    strictPort: false,
  },

  preview: {
    port: 4173,
    open: true,
  },

  css: {
    devSourcemap: true,
  },

  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "framer-motion",
      "lucide-react",
    ],
  },
});
