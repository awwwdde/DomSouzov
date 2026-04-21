"""Public read-only API endpoints."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Dict, Any
from database import get_db
from models import SiteSettings, Event, NewsArticle, Hall, GalleryImage

router = APIRouter(prefix="/api", tags=["public"])


def settings_to_dict(db: Session) -> Dict[str, Dict[str, str]]:
    rows = db.query(SiteSettings).all()
    return {r.key: {"ru": r.value_ru or "", "en": r.value_en or ""} for r in rows}


@router.get("/content")
def get_all_content(db: Session = Depends(get_db)) -> Dict[str, Any]:
    settings = settings_to_dict(db)
    events = db.query(Event).filter(Event.is_active == True).order_by(Event.sort_order).all()
    news = db.query(NewsArticle).filter(NewsArticle.is_active == True).order_by(NewsArticle.sort_order).all()
    halls = db.query(Hall).order_by(Hall.sort_order).all()
    gallery = db.query(GalleryImage).filter(GalleryImage.is_active == True).order_by(GalleryImage.sort_order).all()

    return {
        "settings": settings,
        "events": [_event_out(e) for e in events],
        "news": [_news_out(n) for n in news],
        "halls": [_hall_out(h) for h in halls],
        "gallery": [_gallery_out(g) for g in gallery],
    }


@router.get("/events")
def get_events(db: Session = Depends(get_db)):
    events = db.query(Event).filter(Event.is_active == True).order_by(Event.sort_order).all()
    return [_event_out(e) for e in events]


@router.get("/events/{event_id}")
def get_event(event_id: int, db: Session = Depends(get_db)):
    from fastapi import HTTPException
    e = db.query(Event).filter(Event.id == event_id).first()
    if not e:
        raise HTTPException(404, "Event not found")
    return _event_out(e)


@router.get("/news")
def get_news(db: Session = Depends(get_db)):
    news = db.query(NewsArticle).filter(NewsArticle.is_active == True).order_by(NewsArticle.sort_order).all()
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


def _event_out(e: Event) -> dict:
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
    }


def _news_out(n: NewsArticle) -> dict:
    return {
        "id": n.id,
        "tag": {"ru": n.tag_ru, "en": n.tag_en},
        "title": {"ru": n.title_ru, "en": n.title_en},
        "excerpt": {"ru": n.excerpt_ru, "en": n.excerpt_en},
        "content": {"ru": n.content_ru or "", "en": n.content_en or ""},
        "image": n.image,
        "is_lead": n.is_lead,
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
    }
