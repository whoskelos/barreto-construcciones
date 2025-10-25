// @ts-check
import { defineConfig, passthroughImageService } from "astro/config";

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
      service: passthroughImageService(),
  },

  prefetch: {
      prefetchAll: true,
      defaultStrategy: 'viewport'
  },

  compressHTML: true,

  build: {
      inlineStylesheets: 'auto',
  },

  adapter: vercel({
      webAnalytics: {
          enabled: true
      }
  }),
});