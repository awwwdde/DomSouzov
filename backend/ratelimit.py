"""Общий in-memory rate-limit по IP.

Раньше логика определения IP и подсчёта попыток была продублирована в
`routers/admin.py` (вход) и `routers/public.py` (форма заявок), причём в обоих
местах словарь рос бесконечно: чистились только записи текущего IP, а все
остальные оставались в памяти навсегда. Здесь — одна реализация с очисткой.

Хранилище живёт в памяти процесса, поэтому лимиты считаются на инстанс и
сбрасываются при рестарте. Для нескольких воркеров/реплик нужен общий стор
(Redis) — иначе фактический лимит умножается на число процессов.
"""
import time
from typing import Dict, List

from fastapi import Request

from config import settings

# Как часто пробегаться по всему хранилищу и выкидывать протухшие IP.
_PRUNE_EVERY_SEC = 120


def client_ip(request: Request) -> str:
    """IP клиента с учётом доверенных обратных прокси.

    X-Forwarded-For доверяем только если перед нами реально есть прокси
    (TRUSTED_PROXY_COUNT > 0). Берём IP, добавленный самым внешним доверенным
    прокси (n-й справа): его клиент подделать не может, потому что прокси
    дописывает реальный peer в конец цепочки.

    Важно: при TRUSTED_PROXY_COUNT=0 за прокси все посетители выглядят как
    один IP (адрес прокси), и лимит становится общим на всех.
    """
    n = settings.TRUSTED_PROXY_COUNT
    if n > 0:
        chain = [p.strip() for p in request.headers.get("x-forwarded-for", "").split(",") if p.strip()]
        if len(chain) >= n:
            return chain[-n]
    return request.client.host if request.client else "unknown"


class RateLimiter:
    """Скользящее окно: не больше `max_hits` событий с одного IP за `window_sec`."""

    def __init__(self, max_hits: int, window_sec: int):
        self.max_hits = max_hits
        self.window_sec = window_sec
        self._hits: Dict[str, List[float]] = {}
        self._last_prune = time.time()

    def _prune(self, now: float) -> None:
        """Выбрасывает IP, у которых не осталось свежих отметок."""
        if now - self._last_prune < _PRUNE_EVERY_SEC:
            return
        self._last_prune = now
        cutoff = now - self.window_sec
        self._hits = {
            ip: fresh
            for ip, times in self._hits.items()
            if (fresh := [t for t in times if t > cutoff])
        }

    def is_limited(self, key: str) -> bool:
        """True — лимит исчерпан, запрос надо отклонить (429).

        Сама попытка при этом НЕ засчитывается: счётчик увеличивает `register`.
        Так неудачные входы считаются отдельно от успешных.
        """
        now = time.time()
        self._prune(now)
        fresh = [t for t in self._hits.get(key, []) if now - t < self.window_sec]
        if fresh:
            self._hits[key] = fresh
        else:
            self._hits.pop(key, None)
        return len(fresh) >= self.max_hits

    def register(self, key: str) -> None:
        """Засчитывает одно событие (неудачный вход, отправку формы)."""
        now = time.time()
        self._prune(now)
        fresh = [t for t in self._hits.get(key, []) if now - t < self.window_sec]
        fresh.append(now)
        self._hits[key] = fresh

    def reset(self, key: str) -> None:
        """Сбрасывает счётчик (например, после успешного входа)."""
        self._hits.pop(key, None)

    def tracked_keys(self) -> int:
        """Сколько IP сейчас в памяти — для диагностики и тестов."""
        return len(self._hits)
