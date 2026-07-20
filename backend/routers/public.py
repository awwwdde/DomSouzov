"""Public read-only API endpoints."""
import re
import uuid
import time as _time
from fastapi import APIRouter, Depends, HTTPException, Form, File, UploadFile, Request
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import Dict, Any
from database import get_db
from models import (
    SiteSettings,
    Event,
    NewsArticle,
    Hall,
    GalleryImage,
    Partner,
    EventGalleryImage,
    GalleryCategory,
    AboutHoverTip,
    AboutScatteredPhoto,
    AboutTimelineEvent,
    OrganizerRequest,
    MediaFile,
    Review,
    YandexReview,
)
from config import settings as app_settings
from ratelimit import RateLimiter, client_ip
import filetypes
import mailer
import email_templates
import reviews_yandex

router = APIRouter(prefix="/api", tags=["public"])

_EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


# Анти-абьюз формы «Организаторам»: не больше N заявок с IP за окно —
# защита от спама и заваливания хранилища вложениями. In-memory (на инстанс).
_FORM_LIMITER = RateLimiter(max_hits=5, window_sec=10 * 60)

# Потолки на длину полей: без них в БД можно записать мегабайты текста
# (rate-limit ограничивает частоту, но не размер одной заявки).
_MAX_NAME_LEN = 200
_MAX_PHONE_LEN = 50
_MAX_EMAIL_LEN = 254   # максимум для адреса по RFC 5321
_MAX_MESSAGE_LEN = 5000


# Вложение к заявке — только документы (PDF/DOCX/DOC).
ALLOWED_REQUEST_EXT = {"pdf", "docx", "doc"}
ALLOWED_REQUEST_MIME = {
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/octet-stream",  # некоторые браузеры так помечают .docx
}


@router.post("/organizers/request")
async def organizers_request(
    request: Request,
    name: str = Form(...),
    email: str = Form(...),
    phone: str = Form(""),
    message: str = Form(""),
    consent: bool = Form(False),
    file: UploadFile | None = File(None),
    db: Session = Depends(get_db),
):
    # Rate-limit по IP — против спама/переполнения хранилища.
    ip = client_ip(request)
    if _FORM_LIMITER.is_limited(ip):
        raise HTTPException(429, "Слишком много заявок. Попробуйте позже.")
    _FORM_LIMITER.register(ip)

    name = (name or "").strip()
    email = (email or "").strip()
    phone = (phone or "").strip()
    message = (message or "").strip()

    if not name:
        raise HTTPException(400, "Укажите имя")
    if not _EMAIL_RE.match(email) or len(email) > _MAX_EMAIL_LEN:
        raise HTTPException(400, "Некорректный email")
    if not consent:
        raise HTTPException(400, "Необходимо согласие на обработку персональных данных")
    if len(name) > _MAX_NAME_LEN:
        raise HTTPException(400, f"Имя слишком длинное (максимум {_MAX_NAME_LEN} символов)")
    if len(phone) > _MAX_PHONE_LEN:
        raise HTTPException(400, f"Телефон слишком длинный (максимум {_MAX_PHONE_LEN} символов)")
    if len(message) > _MAX_MESSAGE_LEN:
        raise HTTPException(400, f"Сообщение слишком длинное (максимум {_MAX_MESSAGE_LEN} символов)")

    # Необязательный файл-вложение: валидируем тип/размер, кладём в БД (MediaFile).
    attachment_url = None
    attachment_name = None
    att_bytes = None
    att_mime = None
    if file is not None and file.filename:
        ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
        # Требуем разрешённое расширение (не полагаемся на content-type: браузер
        # может прислать application/octet-stream, что раньше пропускало любой файл).
        if ext not in ALLOWED_REQUEST_EXT:
            raise HTTPException(400, "Можно прикрепить только PDF или DOCX")
        content = await file.read()
        max_bytes = app_settings.MAX_UPLOAD_MB * 1024 * 1024
        if len(content) > max_bytes:
            raise HTTPException(413, f"Файл слишком большой. Максимум — {app_settings.MAX_UPLOAD_MB} МБ.")
        # Вложение приходит от неавторизованного посетителя — проверяем, что
        # содержимое действительно документ, а не переименованный файл.
        if not content or not filetypes.sniff_matches(ext, content[:64]):
            raise HTTPException(400, "Файл повреждён или не является документом PDF/DOC/DOCX")
        stored = f"{uuid.uuid4().hex}.{ext or 'bin'}"
        att_mime = file.content_type or "application/octet-stream"
        db.add(MediaFile(filename=stored, content_type=att_mime, data=content, size=len(content)))
        db.commit()
        attachment_url = f"/uploads/{stored}"
        attachment_name = file.filename
        att_bytes = content

    req = OrganizerRequest(
        name=name, email=email, phone=phone, message=message, consent=True, emailed=False,
        attachment_url=attachment_url, attachment_name=attachment_name,
    )
    db.add(req)
    db.commit()
    db.refresh(req)

    # Получатель: настройка из админки → запасной SMTP_TO → email_rent из настроек.
    recipient_row = db.query(SiteSettings).filter_by(key="organizers_form_email").first()
    recipient = (recipient_row.value_ru if recipient_row else "") or app_settings.SMTP_TO
    if not recipient:
        rent_row = db.query(SiteSettings).filter_by(key="email_rent").first()
        recipient = rent_row.value_ru if rent_row else ""

    subject = f"Заявка с сайта (Организаторам) — {name}"
    text = (
        "Новая заявка с формы «Организаторам»:\n\n"
        f"Имя: {name}\n"
        f"Email: {email}\n"
        f"Телефон: {phone or '—'}\n\n"
        f"Сообщение:\n{message or '—'}\n\n"
        f"Согласие на обработку ПДн (152-ФЗ): да\n"
        f"Вложение: {attachment_name or '—'}\n"
        f"Заявка №{req.id}"
    )
    html = email_templates.organizer_request_html(
        name=name, email=email, phone=phone, message=message,
        request_id=req.id, attachment_name=attachment_name or "",
    )
    attachments = [(attachment_name, att_bytes, att_mime)] if att_bytes else None
    # В лог — только факт и номер заявки. Адреса, имена и названия файлов
    # это персональные данные (152-ФЗ): в логах им не место, сама заявка
    # со всеми полями уже сохранена в БД и видна в админке.
    print(f"[organizers] заявка #{req.id} принята (вложение: {'да' if att_bytes else 'нет'})")
    if not recipient:
        print("[organizers] получатель не определён (нет organizers_form_email / SMTP_TO / email_rent)")
    emailed = (
        mailer.send_email(recipient, subject, text, reply_to=email, html=html, attachments=attachments)
        if recipient
        else False
    )
    if emailed:
        req.emailed = True
        db.commit()

    return {"ok": True}


def settings_to_dict(db: Session) -> Dict[str, Dict[str, str]]:
    rows = db.query(SiteSettings).all()
    return {r.key: {"ru": r.value_ru or "", "en": r.value_en or ""} for r in rows}


@router.get("/content")
def get_all_content(db: Session = Depends(get_db)) -> Dict[str, Any]:
    settings = settings_to_dict(db)
    events = (
        db.query(Event)
        .filter(Event.is_active == True)
        .order_by(desc(Event.is_pinned), desc(Event.pin_order), Event.sort_order, desc(Event.created_at))
        .all()
    )
    news = (
        db.query(NewsArticle)
        .filter(NewsArticle.is_active == True)
        .order_by(desc(NewsArticle.is_pinned), desc(NewsArticle.pin_order), desc(NewsArticle.created_at))
        .all()
    )
    halls = db.query(Hall).order_by(Hall.sort_order).all()
    gallery = db.query(GalleryImage).filter(GalleryImage.is_active == True).order_by(GalleryImage.sort_order).all()
    partners = db.query(Partner).filter(Partner.is_active == True).order_by(Partner.sort_order).all()
    gallery_cats = db.query(GalleryCategory).order_by(GalleryCategory.sort_order).all()
    about_tips = (
        db.query(AboutHoverTip)
        .filter(AboutHoverTip.is_active == True)
        .order_by(AboutHoverTip.sort_order)
        .all()
    )
    about_photos = (
        db.query(AboutScatteredPhoto)
        .filter(AboutScatteredPhoto.is_active == True)
        .order_by(AboutScatteredPhoto.sort_order)
        .all()
    )
    about_timeline = (
        db.query(AboutTimelineEvent)
        .filter(AboutTimelineEvent.is_active == True)
        .order_by(AboutTimelineEvent.sort_order)
        .all()
    )

    return {
        "settings": settings,
        "events": [_event_out(db, e) for e in events],
        "news": [_news_out(n) for n in news],
        "halls": [_hall_out(h) for h in halls],
        "gallery": [_gallery_out(g) for g in gallery],
        "gallery_categories": [_gallery_cat_out(c) for c in gallery_cats],
        "partners": [_partner_out(p) for p in partners],
        "about": {
            "hover_tips": [_about_tip_out(t) for t in about_tips],
            "scattered_photos": [_about_photo_out(p) for p in about_photos],
            "timeline": [_about_timeline_out(e) for e in about_timeline],
        },
    }


@router.get("/events")
def get_events(db: Session = Depends(get_db)):
    events = (
        db.query(Event)
        .filter(Event.is_active == True)
        .order_by(desc(Event.is_pinned), desc(Event.pin_order), Event.sort_order, desc(Event.created_at))
        .all()
    )
    return [_event_out(db, e) for e in events]


@router.get("/events/{event_id}")
def get_event(event_id: int, db: Session = Depends(get_db)):
    from fastapi import HTTPException
    e = db.query(Event).filter(Event.id == event_id).first()
    if not e:
        raise HTTPException(404, "Event not found")
    return _event_out(db, e)


@router.get("/news")
def get_news(db: Session = Depends(get_db)):
    news = (
        db.query(NewsArticle)
        .filter(NewsArticle.is_active == True)
        .order_by(desc(NewsArticle.is_pinned), desc(NewsArticle.pin_order), desc(NewsArticle.created_at))
        .all()
    )
    return [_news_out(n) for n in news]


@router.get("/news/{news_id}")
def get_news_item(news_id: int, db: Session = Depends(get_db)):
    from fastapi import HTTPException
    n = db.query(NewsArticle).filter(NewsArticle.id == news_id).first()
    if not n:
        raise HTTPException(404, "Article not found")
    return _news_out(n)


@router.get("/halls")
def get_halls(db: Session = Depends(get_db)):
    halls = db.query(Hall).order_by(Hall.sort_order).all()
    return [_hall_out(h) for h in halls]


import hashlib as _hashlib
import time as _time

# Троттлинг накопления: не чаще раза в 10 минут пишем в БД новые яндекс-отзывы.
_last_accumulate = {"ts": 0.0}


def _review_key(author: str, text: str) -> str:
    raw = (author or "").strip().lower() + "|" + (text or "").strip()[:80].lower()
    return _hashlib.sha1(raw.encode("utf-8")).hexdigest()


def _accumulate_yandex(db: Session, reviews: list) -> None:
    """Дописываем новые (по ext_key) яндекс-отзывы в накопитель."""
    if not reviews:
        return
    now = _time.time()
    if now - _last_accumulate["ts"] < 600:
        return
    _last_accumulate["ts"] = now
    existing = {k for (k,) in db.query(YandexReview.ext_key).all()}
    added = False
    for r in reviews:
        key = _review_key(r.get("author", ""), r.get("text", ""))
        if key in existing:
            continue
        existing.add(key)
        db.add(YandexReview(
            author=r.get("author") or "Гость",
            text=r.get("text") or "",
            rating=int(r.get("rating") or 5),
            date_label=r.get("date_label") or "",
            ext_key=key,
        ))
        added = True
    if added:
        try:
            db.commit()
        except Exception:
            db.rollback()


@router.get("/reviews")
def get_reviews(db: Session = Depends(get_db)):
    """Отзывы для витрины: закреплённые/ручные (админка) + накопленные с Яндекса.
    Виджет отдаёт лишь ~5 свежих — новые дописываются в БД; на сайте показываем
    5 самых свежих, при появлении нового он встаёт первым."""
    LIMIT = 5

    # 1) Свежие с Яндекса (кэш) + накопление в БД.
    url_row = db.query(SiteSettings).filter_by(key="yandex_reviews_url").first()
    yandex_url = (url_row.value_ru if url_row and url_row.value_ru else reviews_yandex.DEFAULT_WIDGET)
    try:
        y = reviews_yandex.get_yandex_reviews(yandex_url)
    except Exception:
        y = {"rating": None, "reviews": [], "org_url": ""}
    try:
        _accumulate_yandex(db, y.get("reviews", []))
    except Exception:
        db.rollback()

    # 2) Ручные (первыми, закреплённые выше).
    manual = (
        db.query(Review)
        .filter(Review.is_active == True)
        .order_by(Review.is_pinned.desc(), Review.sort_order, Review.id.desc())
        .all()
    )
    manual_out = [
        {"author": r.author, "text": r.text, "rating": r.rating or 5,
         "date_label": r.date_label or "", "source": "manual"}
        for r in manual
    ]

    # 3) Накопленные яндекс-отзывы (свежие сверху), плюс любые из последнего фетча,
    #    которых ещё нет в БД (на случай троттлинга).
    accumulated = (
        db.query(YandexReview)
        .filter(YandexReview.is_hidden == False)
        .order_by(YandexReview.id.desc())
        .all()
    )
    yandex_out = [
        {"author": r.author, "text": r.text, "rating": r.rating or 5,
         "date_label": r.date_label or "", "source": "yandex"}
        for r in accumulated
    ]
    for r in y.get("reviews", []):
        yandex_out.append({
            "author": r.get("author") or "Гость", "text": r.get("text") or "",
            "rating": r.get("rating") or 5, "date_label": r.get("date_label") or "",
            "source": "yandex",
        })

    # 4) Слияние + дедуп по (автор + начало текста).
    seen = set()
    merged = []
    for r in manual_out + yandex_out:
        key = (r["author"].strip().lower(), r["text"].strip()[:50].lower())
        if key in seen:
            continue
        seen.add(key)
        merged.append(r)

    return {
        "rating": y.get("rating"),
        "url": y.get("org_url") or "https://yandex.ru/maps/org/dom_soyuzov/1101563021/reviews/",
        "reviews": merged[:LIMIT],
    }


@router.get("/gallery")
def get_gallery(db: Session = Depends(get_db)):
    gallery = db.query(GalleryImage).filter(GalleryImage.is_active == True).order_by(GalleryImage.sort_order).all()
    return [_gallery_out(g) for g in gallery]


def _event_dates(e: Event) -> list:
    """Сеансы мультидат: JSON-массив из поля dates → список объектов.
    Пусто/невалидно → пустой список (фронт использует одиночную date/time)."""
    import json
    raw = getattr(e, "dates", None)
    if not raw:
        return []
    try:
        parsed = json.loads(raw)
    except Exception:
        return []
    if not isinstance(parsed, list):
        return []
    out = []
    for x in parsed:
        if not isinstance(x, dict) or not x.get("date"):
            continue
        out.append({
            "date": x.get("date", ""),
            "date_en": x.get("date_en", "") or x.get("date", ""),
            "time": x.get("time", "") or e.time,
            "weekday_ru": x.get("weekday_ru", ""),
            "weekday_en": x.get("weekday_en", ""),
        })
    return out


def _event_out(db: Session, e: Event) -> dict:
    imgs = (
        db.query(EventGalleryImage)
        .filter(EventGalleryImage.event_id == e.id)
        .order_by(EventGalleryImage.sort_order)
        .all()
    )
    gallery = []
    for img in imgs:
        gallery.append(
            {
                "id": img.id,
                "image": img.image,
                "caption": {"ru": img.caption_ru or "", "en": img.caption_en or ""},
                "order": img.sort_order,
            }
        )
    return {
        "id": e.id,
        "title": {"ru": e.title_ru, "en": e.title_en},
        "date": {"ru": e.date, "en": e.date_en},
        "time": e.time,
        "weekday": {"ru": e.weekday_ru, "en": e.weekday_en},
        "dates": _event_dates(e),
        "hall": {"ru": e.hall_ru, "en": e.hall_en},
        "tag": {"ru": e.tag_ru, "en": e.tag_en},
        "price": {"ru": e.price_ru, "en": e.price_en},
        "description": {"ru": e.description_ru or "", "en": e.description_en or ""},
        "image": e.image,
        "image_vertical": getattr(e, "image_vertical", None),
        "is_featured": e.is_featured,
        "is_lead": bool(getattr(e, "is_lead", False)),
        "has_ticket": bool(getattr(e, "has_ticket", False)),
        "ticket_url": getattr(e, "ticket_url", None),
        "age_rating": getattr(e, "age_rating", None),
        "is_pinned": bool(getattr(e, "is_pinned", False)),
        "pin_order": int(getattr(e, "pin_order", 0) or 0),
        "gallery": gallery,
    }


def _news_out(n: NewsArticle) -> dict:
    import json
    created = n.created_at.isoformat() if n.created_at else None
    gallery = []
    raw = getattr(n, "gallery", None)
    if raw:
        try:
            parsed = json.loads(raw)
            if isinstance(parsed, list):
                for u in parsed:
                    # Легаси: строка-URL = фото. Новый формат: {type, url}.
                    if isinstance(u, str) and u:
                        gallery.append({"type": "image", "url": u})
                    elif isinstance(u, dict) and u.get("url"):
                        kind = u.get("type")
                        gallery.append({
                            "type": kind if kind in ("image", "video") else "image",
                            "url": u["url"],
                        })
        except Exception:
            gallery = []
    return {
        "id": n.id,
        "tag": {"ru": n.tag_ru, "en": n.tag_en},
        "title": {"ru": n.title_ru, "en": n.title_en},
        "excerpt": {"ru": n.excerpt_ru, "en": n.excerpt_en},
        "content": {"ru": n.content_ru or "", "en": n.content_en or ""},
        "image": n.image,
        "gallery": gallery,
        "is_lead": n.is_lead,
        "is_pinned": bool(getattr(n, "is_pinned", False)),
        "pin_order": int(getattr(n, "pin_order", 0) or 0),
        "created_at": created,
    }


def _hall_features(h: Hall) -> list:
    """Особенности зала хранятся JSON-массивом в features_ru.
    Возвращаем список {title:{ru,en}, text:{ru,en}}; легаси-строки игнорируем."""
    import json
    raw = h.features_ru or ""
    try:
        parsed = json.loads(raw)
    except Exception:
        return []
    if not isinstance(parsed, list):
        return []
    out = []
    for x in parsed:
        if not isinstance(x, dict):
            continue
        out.append({
            "title": {"ru": x.get("title_ru", ""), "en": x.get("title_en", "")},
            "text": {"ru": x.get("text_ru", ""), "en": x.get("text_en", "")},
        })
    return out


def _hall_gallery(h: Hall) -> list:
    """Фото зала для слайдера: JSON-массив URL из поля gallery."""
    import json
    raw = getattr(h, "gallery", None)
    out = []
    if raw:
        try:
            parsed = json.loads(raw)
            if isinstance(parsed, list):
                out = [str(u) for u in parsed if u]
        except Exception:
            out = []
    # подстраховка: если массива нет, но есть главное фото — отдаём его
    if not out and h.image:
        out = [h.image]
    return out


def _hall_schemes(h: Hall) -> list:
    """Схемы зала для слайдера: JSON-массив URL из поля schemes.
    Подстраховка: если массива нет, но есть легаси-поле scheme — отдаём его."""
    import json
    raw = getattr(h, "schemes", None)
    out = []
    if raw:
        try:
            parsed = json.loads(raw)
            if isinstance(parsed, list):
                out = [str(u) for u in parsed if u]
        except Exception:
            out = []
    if not out and getattr(h, "scheme", None):
        out = [h.scheme]
    return out


def _hall_equipment_blocks(h: Hall) -> list:
    """Блоки оборудования: [{text:{ru,en}, image}]. Источник — JSON equipment_blocks;
    если пусто — собираем из легаси-строк equipment_ru/en (без картинок)."""
    import json
    out = []
    raw = getattr(h, "equipment_blocks", None)
    if raw:
        try:
            parsed = json.loads(raw)
            if isinstance(parsed, list):
                for b in parsed:
                    if not isinstance(b, dict):
                        continue
                    text_ru = str(b.get("text_ru", "") or "")
                    text_en = str(b.get("text_en", "") or "")
                    image = b.get("image") or None
                    if text_ru or text_en or image:
                        out.append({"text": {"ru": text_ru, "en": text_en}, "image": image})
        except Exception:
            out = []
    if not out:
        ru_lines = _split_lines(getattr(h, "equipment_ru", ""))
        en_lines = _split_lines(getattr(h, "equipment_en", ""))
        for i, ru in enumerate(ru_lines):
            en = en_lines[i] if i < len(en_lines) else ""
            out.append({"text": {"ru": ru, "en": en}, "image": None})
    return out


def _hall_out(h: Hall) -> dict:
    return {
        "id": h.id,
        "name": {"ru": h.name_ru, "en": h.name_en},
        "capacity": h.capacity,
        "area": h.area,
        "columns": h.columns,
        "features": {"ru": h.features_ru, "en": h.features_en},
        "features_list": _hall_features(h),
        "description": {"ru": h.description_ru or "", "en": h.description_en or ""},
        "image": h.image,
        "gallery": _hall_gallery(h),
        "scheme": getattr(h, "scheme", None),
        "schemes": _hall_schemes(h),
        "equipment": {
            "ru": getattr(h, "equipment_ru", "") or "",
            "en": getattr(h, "equipment_en", "") or "",
        },
        "equipment_list": {
            "ru": _split_lines(getattr(h, "equipment_ru", "")),
            "en": _split_lines(getattr(h, "equipment_en", "")),
        },
        "equipment_blocks": _hall_equipment_blocks(h),
        "rider_only": bool(getattr(h, "rider_only", False)),
    }


def _split_lines(raw) -> list:
    """Оборудование хранится по строке на пункт; поддерживаем и разделитель ';'."""
    if not raw:
        return []
    parts = []
    for line in str(raw).replace(";", "\n").splitlines():
        s = line.strip().lstrip("-•·").strip()
        if s:
            parts.append(s)
    return parts


def _gallery_out(g: GalleryImage) -> dict:
    return {
        "id": g.id,
        "caption": {"ru": g.caption_ru or "", "en": g.caption_en or ""},
        "category": {"ru": g.category_ru, "en": g.category_en},
        "image": g.image,
        "span": g.span,
        "category_id": getattr(g, "category_id", None),
        "is_video": bool(getattr(g, "is_video", False)),
        "video_url": getattr(g, "video_url", None),
    }


def _gallery_cat_out(c: GalleryCategory) -> dict:
    return {
        "id": c.id,
        "slug": c.slug,
        "name": {"ru": c.name_ru, "en": c.name_en},
        "cover_image": c.cover_image,
        "cover_video": getattr(c, "cover_video", None),
        "order": c.sort_order,
    }


def _partner_out(p: Partner) -> dict:
    return {
        "id": p.id,
        "name": {"ru": p.name_ru, "en": p.name_en},
        "logo": p.logo,
        "url": p.url or "",
        "sort_order": p.sort_order,
        "is_active": p.is_active,
    }


def _about_tip_out(t: AboutHoverTip) -> dict:
    return {
        "id": t.id,
        "phrase": {"ru": t.phrase_ru, "en": t.phrase_en},
        "media_url": t.media_url,
        "media_type": t.media_type or "image",
        "caption": {"ru": t.caption_ru or "", "en": t.caption_en or ""},
        "sort_order": t.sort_order,
    }


def _about_photo_out(p: AboutScatteredPhoto) -> dict:
    return {
        "id": p.id,
        "image": p.image,
        "caption": {"ru": p.caption_ru or "", "en": p.caption_en or ""},
        "col_start": p.col_start,
        "col_span": p.col_span,
        "offset_y": p.offset_y,
        "parallax_speed": p.parallax_speed,
        "reveal_progress": p.reveal_progress,
        "sort_order": p.sort_order,
    }


def _about_timeline_out(e: AboutTimelineEvent) -> dict:
    return {
        "id": e.id,
        "year": e.year,
        "tag": {"ru": e.tag_ru or "", "en": e.tag_en or ""},
        "title": {"ru": e.title_ru, "en": e.title_en},
        "description": {"ru": e.description_ru or "", "en": e.description_en or ""},
        "image": e.image,
        "sort_order": e.sort_order,
    }
