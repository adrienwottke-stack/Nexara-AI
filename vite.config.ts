import { defineConfig } from 'vite'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  server: {
    port: Number(process.env.PORT) || 5173,
    strictPort: false,
  },
  build: {
    target: 'es2020',
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        websites: fileURLToPath(new URL('./websites.html', import.meta.url)),
        automatisierung: fileURLToPath(new URL('./automatisierung/index.html', import.meta.url)),
        automatisierungHausverwaltung: fileURLToPath(new URL('./automatisierung/hausverwaltung/index.html', import.meta.url)),
        automatisierungHandwerk: fileURLToPath(new URL('./automatisierung/handwerk/index.html', import.meta.url)),
        automatisierungIngenieurbuero: fileURLToPath(new URL('./automatisierung/ingenieurbuero/index.html', import.meta.url)),
        automatisierungDanke: fileURLToPath(new URL('./automatisierung/danke/index.html', import.meta.url)),
        impressum: fileURLToPath(new URL('./impressum.html', import.meta.url)),
        datenschutz: fileURLToPath(new URL('./datenschutz.html', import.meta.url)),
      },
    },
  },
})
