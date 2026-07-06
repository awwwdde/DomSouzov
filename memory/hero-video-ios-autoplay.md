---
name: hero-video-ios-autoplay
description: Почему hero-видео не автоплеится на iPhone и как чинить (Home/About)
metadata:
  type: project
---

Hero-видео на главной и «О доме» рендерится через общий компонент `frontend/src/components/HeroVideo.tsx` (используется в `Home.tsx` и `About.tsx`).

**Рабочая конфигурация для автоплея на iOS Safari:** чисто декларативно — `muted` + `autoPlay` + `playsInline` + `preload="metadata"`, плюс через ref проставлять DOM-атрибут `muted` (React ставит только свойство). НЕ ставить `preload="auto"` и НЕ вызывать `.play()` на монтировании: hero-файл тяжёлый (был 1920×1080, 67 c, ~17.6 Mbps, ~140 МБ), и с `preload="auto"` iOS пытается буферизировать весь файл и застревает на первом кадре. Программный `play()` допустим только как фолбэк по первому касанию (Low Power Mode).

**Регрессия (2026-07-03, коммит f6200fd «mobile fix»):** заменил `preload="metadata"`→`auto` и добавил eager `play()` — это и сломало автоплей на iPhone (до ~1 июля работало). Откат к `preload="metadata"` без eager play() чинит.

**Рекомендация на будущее:** hero-loop нужно пережимать до ~1080p / ~3 Mbps (≈25 МБ), faststart — иначе на слабой мобильной сети старт всё равно тормозит. На машине сейчас нет ffmpeg. См. [[domsouzov-decisions]].
