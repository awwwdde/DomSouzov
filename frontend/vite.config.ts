import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { WATERMARK_AUTHOR, WATERMARK_URL } from './src/lib/watermark'

/* ============================================================ */
/* ВОДЯНОЙ ЗНАК АВТОРА — только в прод-сборке.                  */
/*  • шапка-комментарий в каждом JS-чанке и CSS-файле;          */
/*  • комментарий в <head> собранного index.html.               */
/*  Комментарий вставляем в generateBundle (после минификации), */
/*  иначе esbuild/terser вырежет его вместе с прочими.          */
/*  Сообщение в консоли браузера — в src/main.tsx.              */
/* ============================================================ */
function watermark(): Plugin {
  const banner = `/*! ${WATERMARK_AUTHOR} · ${WATERMARK_URL} */\n`
  return {
    name: 'awwwdde-watermark',
    apply: 'build',
    enforce: 'post',
    transformIndexHtml(html) {
      return html.replace(
        /<head>/i,
        `<head>\n    <!-- ${WATERMARK_AUTHOR} · ${WATERMARK_URL} -->`,
      )
    },
    // order: 'post' — иначе Vite своим generateBundle дописывает в начало
    // входного чанка преамбулу (__vite__mapDeps) уже поверх нашего баннера.
    generateBundle: {
      order: 'post',
      handler(_options, bundle) {
        for (const file of Object.values(bundle)) {
          if (file.type === 'chunk') {
            file.code = banner + file.code
          } else if (file.fileName.endsWith('.css') && typeof file.source === 'string') {
            file.source = banner + file.source
          }
        }
      },
    },
  }
}

export default defineConfig({
  plugins: [react(), watermark()],
  server: {
    port: 5173,
    host: '127.0.0.1',
    proxy: {
      '/api': 'http://localhost:8001',
      '/uploads': 'http://localhost:8001',
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Вендоры в отдельные чанки — кэшируются между релизами,
        // не перезагружаются при правках кода приложения.
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          motion: ['framer-motion'],
        },
      },
    },
  },
})
