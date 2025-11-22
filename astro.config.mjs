// @ts-check
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

import vercel from "@astrojs/vercel";
import node from "@astrojs/node";

import partytown from '@astrojs/partytown';

const isVercel = process.env.VERCEL === '1';

// https://astro.build/config
export default defineConfig({
  site: 'https://barretoconstrucciones.es',

  vite: {
      plugins: [tailwindcss()],
      ssr: {
          // Sharp es necesario en Node, no debe ser externo si usamos el adaptador de Node
          external: isVercel ? ['sharp'] : []
      },
      build: {
          cssMinify: 'lightningcss',
          rollupOptions: {
              output: {
                  manualChunks: {
                      'animations': ['gsap'],
                  }
              }
          }
      }
  },

  image: {
      // Usar sharp para optimización de imágenes en producción
      // Vercel lo incluye por defecto, en Node usamos sharp instalado
      domains: ['barretoconstrucciones.es'],
      remotePatterns: [{ protocol: 'https' }],
  },

  prefetch: {
      prefetchAll: true,
      defaultStrategy: 'hover'
  },

  compressHTML: true,

  build: {
      inlineStylesheets: 'auto',
  },

  output: 'server',

  adapter: isVercel 
    ? vercel({
        webAnalytics: {
            enabled: false
        }
      })
    : node({
        mode: 'standalone'
      }),

  integrations: [partytown({
    config: {
      forward: ["dataLayer.push", "gtag"],
    },
  })],
});