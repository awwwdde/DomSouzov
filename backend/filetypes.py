"""Проверка загружаемых файлов по фактическому содержимому (magic bytes).

Расширение и Content-Type задаёт клиент, поэтому доверять им нельзя: файл
с любым содержимым можно прислать как `photo.png` с `image/png`. Здесь мы
смотрим на первые байты и убеждаемся, что содержимое соответствует
заявленному расширению.

Это не антивирус — задача скромнее: не дать положить в хранилище что-то,
чем оно притворяться не должно (HTML/скрипт под видом картинки и т.п.).
"""
from typing import Optional

# Категория -> список сигнатур (offset, ожидаемые байты).
# Для контейнеров, где сигнатура не в начале (mp4/mov — 'ftyp' с 4-го байта),
# offset соответственно смещён.
_SIGNATURES = {
    "jpg":  [(0, b"\xff\xd8\xff")],
    "jpeg": [(0, b"\xff\xd8\xff")],
    "png":  [(0, b"\x89PNG\r\n\x1a\n")],
    "gif":  [(0, b"GIF87a"), (0, b"GIF89a")],
    "webp": [(0, b"RIFF")],           # + 'WEBP' на 8-м байте, проверяется ниже
    "pdf":  [(0, b"%PDF-")],
    "mp4":  [(4, b"ftyp")],
    "m4v":  [(4, b"ftyp")],
    "mov":  [(4, b"ftyp"), (4, b"moov"), (4, b"mdat"), (4, b"free"), (4, b"wide")],
    "webm": [(0, b"\x1a\x45\xdf\xa3")],   # Matroska/EBML
    "mkv":  [(0, b"\x1a\x45\xdf\xa3")],
    "ogg":  [(0, b"OggS")],
    "avi":  [(0, b"RIFF")],           # + 'AVI ' на 8-м байте
    # DOCX — это ZIP; DOC — старый OLE-контейнер.
    "docx": [(0, b"PK\x03\x04"), (0, b"PK\x05\x06"), (0, b"PK\x07\x08")],
    "doc":  [(0, b"\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1"), (0, b"PK\x03\x04")],
}

# Вторичная метка для RIFF-контейнеров: байты 8..12.
_RIFF_FORM = {"webp": b"WEBP", "avi": b"AVI "}

# SVG — текстовый формат без бинарной сигнатуры, проверяем разметкой.
_SVG_MARKERS = (b"<svg", b"<?xml")


def sniff_matches(ext: str, head: bytes) -> bool:
    """True, если содержимое `head` похоже на формат `ext`.

    Неизвестное расширение считаем несовпавшим — вызывающий код решает,
    пропускать ли такой файл.
    """
    ext = (ext or "").lower().lstrip(".")

    if ext == "svg":
        probe = head[:1024].lstrip()
        return any(m in probe.lower() for m in (b"<svg",)) or probe.startswith(_SVG_MARKERS)

    sigs = _SIGNATURES.get(ext)
    if not sigs:
        return False

    for offset, magic in sigs:
        if head[offset:offset + len(magic)] == magic:
            form = _RIFF_FORM.get(ext)
            # RIFF используют и WebP, и AVI, и WAV — уточняем по типу формы.
            if magic == b"RIFF" and form is not None:
                if head[8:12] != form:
                    continue
            return True
    return False


def describe(head: bytes) -> Optional[str]:
    """Грубое определение фактического типа — для понятного текста ошибки."""
    if head[:2] == b"MZ":
        return "исполняемый файл Windows"
    if head[:4] == b"\x7fELF":
        return "исполняемый файл Linux"
    if head[:5] == b"%PDF-":
        return "PDF"
    if head[:8] == b"\x89PNG\r\n\x1a\n":
        return "PNG"
    if head[:3] == b"\xff\xd8\xff":
        return "JPEG"
    probe = head[:512].lstrip().lower()
    if probe.startswith(b"<!doctype html") or probe.startswith(b"<html") or b"<script" in probe:
        return "HTML/скрипт"
    return None
