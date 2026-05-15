"""Public read-only API endpoints."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import Dict, Any
from database import get_db
from models import SiteSettings, Event, NewsArticle, Hall, GalleryImage, Partner, EventGalleryImage, GalleryCategory

router = APIRouter(prefix="/api", tags=["public"])


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

    return {
        "settings": settings,
        "events": [_event_out(db, e) for e in events],
        "news": [_news_out(n) for n in news],
        "halls": [_hall_out(h) for h in halls],
        "gallery": [_gallery_out(g) for g in gallery],
        "gallery_categories": [_gallery_cat_out(c) for c in gallery_cats],
        "partners": [_partner_out(p) for p in partners],
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
        "is_pinned": bool(getattr(e, "is_pinned", False)),
        "pin_order": int(getattr(e, "pin_order", 0) or 0),
        "gallery": gallery,
    }


def _news_out(n: NewsArticle) -> dict:
    created = n.created_at.isoformat() if n.created_at else None
    return {
        "id": n.id,
        "tag": {"ru": n.tag_ru, "en": n.tag_en},
        "title": {"ru": n.title_ru, "en": n.title_en},
        "excerpt": {"ru": n.excerpt_ru, "en": n.excerpt_en},
        "content": {"ru": n.content_ru or "", "en": n.content_en or ""},
        "image": n.image,
        "is_lead": n.is_lead,
        "is_pinned": bool(getattr(n, "is_pinned", False)),
        "pin_order": int(getattr(n, "pin_order", 0) or 0),
        "created_at": created,
    }


def _hall_out(h: Hall) -> dict:
    return {
        "id": h.id,
        "name": {"ru": h.name_ru, "en": h.name_en},
        "capacity": h.capacity,
        "area": h.area,
        "columns": h.columns,
        "features": {"ru": h.features_ru, "en": h.features_en},
        "description": {"ru": h.description_ru or "", "en": h.description_en or ""},
        "image": h.image,
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
