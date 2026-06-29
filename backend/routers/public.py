"""Public read-only API endpoints."""
import re
import uuid
from fastapi import APIRouter, Depends, HTTPException, Form, File, UploadFile
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import desc
from sqlalchemy.exc import IntegrityError
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
    NewsletterSubscriber,
    OrganizerRequest,
    MediaFile,
)
from config import settings as app_settings
import mailer
import email_templates

router = APIRouter(prefix="/api", tags=["public"])

_EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


class SubscribeIn(BaseModel):
    email: str


@router.post("/subscribe")
def subscribe(body: SubscribeIn, db: Session = Depends(get_db)):
    email = (body.email or "").strip().lower()
    if not _EMAIL_RE.match(email):
        raise HTTPException(400, "Некорректный email")
    existing = db.query(NewsletterSubscriber).filter_by(email=email).first()
    if existing:
        return {"ok": True, "already": True}
    try:
        db.add(NewsletterSubscriber(email=email))
        db.commit()
    except IntegrityError:
        db.rollback()
    return {"ok": True}


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
    name: str = Form(...),
    email: str = Form(...),
    phone: str = Form(""),
    message: str = Form(""),
    consent: bool = Form(False),
    file: UploadFile | None = File(None),
    db: Session = Depends(get_db),
):
    name = (name or "").strip()
    email = (email or "").strip()
    phone = (phone or "").strip()
    message = (message or "").strip()

    if not name:
        raise HTTPException(400, "Укажите имя")
    if not _EMAIL_RE.match(email):
        raise HTTPException(400, "Некорректный email")
    if not consent:
        raise HTTPException(400, "Необходимо согласие на обработку персональных данных")

    # Необязательный файл-вложение: валидируем тип/размер, кладём в БД (MediaFile).
    attachment_url = None
    attachment_name = None
    att_bytes = None
    att_mime = None
    if file is not None and file.filename:
        ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
        if ext not in ALLOWED_REQUEST_EXT and (file.content_type or "") not in ALLOWED_REQUEST_MIME:
            raise HTTPException(400, "Можно прикрепить только PDF или DOCX")
        content = await file.read()
        max_bytes = app_settings.MAX_UPLOAD_MB * 1024 * 1024
        if len(content) > max_bytes:
            raise HTTPException(413, f"Файл слишком большой. Максимум — {app_settings.MAX_UPLOAD_MB} МБ.")
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
    print(f"[organizers] заявка #{req.id}: получатель={recipient!r}, вложение={attachment_name!r}")
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
        .order_by(desc(NewsArticle.is_pinned), desc(NewsArticle.pin_order), NewsArticle.sort_order, desc(NewsArticle.created_at))
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
        .order_by(desc(NewsArticle.is_pinned), desc(NewsArticle.pin_order), NewsArticle.sort_order, desc(NewsArticle.created_at))
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
    }


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
