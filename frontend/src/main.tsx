import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import App from './App.tsx'

// Отключаем браузерное восстановление скролла: иначе при SPA-переходе Chrome
// возвращает прежнюю позицию после смены контента и «уносит» страницу вниз/вверх
// (контент мелькает и пропадает). Скроллом управляем сами (PageTransition).
if (typeof history !== 'undefined' && 'scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>,
)
