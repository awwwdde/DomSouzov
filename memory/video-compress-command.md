---
name: video-compress-command
description: Команда ffmpeg для пережатия видео сайта под мобильный автоплей
metadata:
  type: reference
---

Для hero/фоновых видео сайта их нужно пережимать до ~3 Mbps 1080p с faststart, иначе iOS не автоплеит (см. [[hero-video-ios-autoplay]]).

**ffmpeg установлен** через winget (Gyan.FFmpeg). После перезапуска оболочки доступен как `ffmpeg`/`ffprobe`. Полный путь, если alias не подхватился:
`C:\Users\vlad\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1.2-full_build\bin\ffmpeg.exe`

**Пережатие (1080p, ~3 Mbps, faststart, без звука — фону не нужен):**
```
ffmpeg -y -i INPUT.mp4 -c:v libx264 -profile:v high -level 4.0 -pix_fmt yuv420p \
  -crf 24 -maxrate 3200k -bufsize 6400k -preset slow -movflags +faststart -an OUTPUT.mp4
```

**Постер из кадра (на 1.5 с):**
```
ffmpeg -y -ss 1.5 -i INPUT.mp4 -frames:v 1 -q:v 3 poster.jpg
```

Проверено 2026-07-06: боевое hero-видео 148 МБ / 21 Mbps → 19 МБ / 2.88 Mbps, 1080p, faststart. Готовые файлы клали в `C:\Users\vlad\Downloads\` и заливали через админку → Настройки (поля hero-видео и постер hero-видео). Проверить результат: `ffprobe -v error -show_entries stream=width,height,codec_name -show_entries format=size,bit_rate FILE`.
