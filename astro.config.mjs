// @ts-check
import react from '@astrojs/react'
import tailwind from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  output: 'static',
  build: {
    inlineStylesheets: 'auto',
  },
  markdown: {
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
      wrap: false,
    },
  },
  vite: {
    plugins: [tailwind()],
    ssr: {
      noExternal: ['@fontsource/inter', '@fontsource/jetbrains-mono'],
    },
  },
})
