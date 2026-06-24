"""Public read-only API endpoints."""
import re
from fastapi import APIRouter, Depends, HTTPException
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
)

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
        "hall": {"ru": e.hall_ru, "en": e.hall_en},
        "tag": {"ru": e.tag_ru, "en": e.tag_en},
        "price": {"ru": e.price_ru, "en": e.price_en},
        "description": {"ru": e.description_ru or "", "en": e.description_en or ""},
        "image": e.image,
        "is_featured": e.is_featured,
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
                gallery = [str(u) for u in parsed if u]
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
