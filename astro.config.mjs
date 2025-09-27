// @ts-check
import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import tailwind from '@tailwindcss/vite'

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  output: 'static',
  build: {
    inlineStylesheets: 'auto',
  },
  vite: {
    plugins: [tailwind()],
    ssr: {
      noExternal: ['@fontsource/geist-sans', '@fontsource/geist-mono'],
    },
  },
})
