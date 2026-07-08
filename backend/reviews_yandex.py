"""Авто-отзывы с Яндекс Карт.

Виджет `maps-reviews-widget` отдаёт готовый HTML с несколькими последними
отзывами. Мы забираем его на сервере, парсим (имя, дата, оценка, текст),
кэшируем на диск (том uploads) с TTL и при сбое сети отдаём последний
успешный результат. Парсинг чужой вёрстки хрупкий — поэтому всё обёрнуто
в try/except и всегда есть фолбэк на кэш.
"""
from __future__ import annotations

import json
import re
import time
import urllib.request
from html import unescape
from pathlib import Path
from typing import Optional

# TTL кэша: как часто ходить в Яндекс (сек). 12 часов.
CACHE_TTL = 12 * 60 * 60
# Файл кэша в томе uploads — переживает перезапуск контейнера.
CACHE_FILE = Path(__file__).resolve().parent.parent / "uploads" / ".reviews_cache.json"
DEFAULT_WIDGET = "https://yandex.ru/maps-reviews-widget/1101563021?comments"
_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"

# Кэш в памяти процесса: {url, ts, data}
_mem: dict = {}


def _strip_tags(s: str) -> str:
    s = re.sub(r"<[^>]+>", "", s)
    return unescape(s).replace("\xa0", " ").strip()


def _parse(html: str) -> dict:
    """Достаём общий рейтинг и список отзывов из HTML виджета."""
    html = re.sub(r"<style.*?</style>", "", html, flags=re.S)
    html = re.sub(r"<script.*?</script>", "", html, flags=re.S)

    reviews = []
    blocks = re.split(r'<div class="comment">', html)[1:]
    for b in blocks:
        name_m = re.search(r'class="comment__name"[^>]*>(.*?)</div>', b, re.S)
        date_m = re.search(r'class="comment__date"[^>]*>(.*?)</div>', b, re.S)
        text_m = re.search(r'class="comment__text"[^>]*>(.*?)</div>', b, re.S)
        date = _strip_tags(date_m.group(1)) if date_m else ""
        name = _strip_tags(name_m.group(1)) if name_m else ""
        # В имени иногда «приклеена» дата — срезаем хвост.
        if date and name.endswith(date):
            name = name[: -len(date)].strip()
        text = _strip_tags(text_m.group(1)) if text_m else ""
        # Оценка: считаем незаполненные звёзды.
        empty = b.count("_empty")
        rating = max(0, 5 - empty) if "stars-list__star" in b else 5
        if text:
            reviews.append({
                "author": name or "Гость",
                "date_label": date,
                "text": text,
                "rating": rating,
                "source": "yandex",
            })

    rating_val = None
    rm = re.search(r'stars-count[^>]*>([\d.,]+)<', html)
    if rm:
        try:
            rating_val = float(rm.group(1).replace(",", "."))
        except ValueError:
            rating_val = None

    # Ссылка на страницу отзывов организации на Яндекс Картах.
    org_url = ""
    um = re.search(r'href="(https://yandex\.ru/maps/org/[^"?]+/reviews/?)"', html)
    if um:
        org_url = um.group(1).replace("&amp;", "&")

    return {"rating": rating_val, "reviews": reviews, "org_url": org_url}


def _read_disk() -> Optional[dict]:
    try:
        return json.loads(CACHE_FILE.read_text(encoding="utf-8"))
    except Exception:
        return None


def _write_disk(payload: dict) -> None:
    try:
        CACHE_FILE.parent.mkdir(parents=True, exist_ok=True)
        CACHE_FILE.write_text(json.dumps(payload, ensure_ascii=False), encoding="utf-8")
    except Exception:
        pass


def _fetch(url: str) -> dict:
    req = urllib.request.Request(url, headers={"User-Agent": _UA, "Accept-Language": "ru"})
    with urllib.request.urlopen(req, timeout=8) as resp:
        raw = resp.read().decode("utf-8", errors="replace")
    return _parse(raw)


def get_yandex_reviews(url: str = DEFAULT_WIDGET, force: bool = False) -> dict:
    """Вернуть {rating, reviews:[...]}. Кэш память → диск → сеть, с фолбэком."""
    now = time.time()
    if not force and _mem.get("url") == url and now - _mem.get("ts", 0) < CACHE_TTL:
        return _mem["data"]

    # Диск как «тёплый» кэш при старте процесса.
    if not force and not _mem:
        disk = _read_disk()
        if disk and disk.get("url") == url and now - disk.get("ts", 0) < CACHE_TTL:
            _mem.update({"url": url, "ts": disk["ts"], "data": disk["data"]})
            return disk["data"]

    try:
        data = _fetch(url)
        if data.get("reviews"):
            _mem.update({"url": url, "ts": now, "data": data})
            _write_disk({"url": url, "ts": now, "data": data})
            return data
        raise ValueError("no reviews parsed")
    except Exception:
        # Сеть/парсинг упали — отдаём последний успешный результат.
        if _mem.get("data"):
            return _mem["data"]
        disk = _read_disk()
        if disk and disk.get("data"):
            return disk["data"]
        return {"rating": None, "reviews": []}
