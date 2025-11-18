// @ts-check
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

import vercel from "@astrojs/vercel";

// https://astro.build/config
export default defineConfig({
  site: 'https://barretoconstrucciones.es',
  
  vite: {
      plugins: [tailwindcss()],
      build: {
          cssMinify: 'lightningcss',
          rollupOptions: {
              output: {
                  manualChunks: {
                      'carousel': ['embla-carousel', 'embla-carousel-autoplay'],
                      'animations': ['gsap'],
                  }
              }
          }
      }
  },

  image: {
      // Usar sharp para optimización de imágenes en producción
      // Vercel lo incluye por defecto
      domains: ['barretoconstrucciones.es'],
      remotePatterns: [{ protocol: 'https' }],
  },

  prefetch: {
      prefetchAll: true,
      defaultStrategy: 'viewport'
  },

  compressHTML: true,

  build: {
      inlineStylesheets: 'auto',
  },

  output: 'server',

  adapter: vercel({
      webAnalytics: {
          enabled: false
      }
  }),
});