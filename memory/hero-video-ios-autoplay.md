---
name: hero-video-ios-autoplay
description: Почему hero-видео не автоплеится на iPhone и как чинить (Home/About)
metadata:
  type: project
---

Hero-видео на главной и «О доме» рендерится через общий компонент `frontend/src/components/HeroVideo.tsx` (используется в `Home.tsx` и `About.tsx`).

**Рабочая конфигурация для автоплея на iOS Safari:** чисто декларативно — `muted` + `autoPlay` + `playsInline` + `preload="metadata"`, плюс через ref проставлять DOM-атрибут `muted` (React ставит только свойство). НЕ ставить `preload="auto"` и НЕ вызывать `.play()` на монтировании: hero-файл тяжёлый (был 1920×1080, 67 c, ~17.6 Mbps, ~140 МБ), и с `preload="auto"` iOS пытается буферизировать весь файл и застревает на первом кадре. Программный `play()` допустим только как фолбэк по первому касанию (Low Power Mode).

**Регрессия (2026-07-03, коммит f6200fd «mobile fix»):** заменил `preload="metadata"`→`auto` и добавил eager `play()` — это и сломало автоплей на iPhone (до ~1 июля работало). Откат к `preload="metadata"` без eager play() чинит.

**Вес файла — вторая причина:** боевое hero-видео было 148 МБ / 21 Mbps 1080p — iOS Safari такое на мобильной сети не автоплеит (показывает первый кадр). Сервер отдаёт видео корректно (Range 206, video/mp4, faststart) — проблема была именно в весе. Решение: пережать до ~3 Mbps (≈19 МБ) + задать постер. Точная команда — [[video-compress-command]]. См. также [[domsouzov-decisions]].
