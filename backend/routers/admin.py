"""Admin CRUD API endpoints (JWT-protected)."""
import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import AdminUser, SiteSettings, Event, NewsArticle, Hall, GalleryImage
from schemas import (
    Token, LoginRequest,
    SettingsUpdate, SettingItem,
    EventCreate, EventUpdate, EventOut,
    NewsCreate, NewsUpdate, NewsOut,
    HallCreate, HallUpdate, HallOut,
    GalleryCreate, GalleryUpdate, GalleryOut,
)
from auth import verify_password, create_access_token, get_current_admin, hash_password
from config import settings as app_settings
import aiofiles

router = APIRouter(prefix="/api/admin", tags=["admin"])

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}


# ──────────── AUTH ────────────

@router.post("/login", response_model=Token)
def login(form: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(AdminUser).filter(AdminUser.email == form.email).first()
    if not user or not verify_password(form.password, user.hashed_password):
        raise HTTPException(401, "Incorrect email or password")
    token = create_access_token({"sub": user.email})
    return {"access_token": token, "token_type": "bearer"}


@router.get("/me")
def get_me(current: AdminUser = Depends(get_current_admin)):
    return {"email": current.email, "id": current.id}


@router.post("/change-password")
def change_password(
    body: dict,
    db: Session = Depends(get_db),
    current: AdminUser = Depends(get_current_admin),
):
    if not verify_password(body.get("current_password", ""), current.hashed_password):
        raise HTTPException(400, "Current password is incorrect")
    current.hashed_password = hash_password(body["new_password"])
    db.commit()
    return {"ok": True}


# ──────────── UPLOAD ────────────

@router.post("/upload")
async def upload_image(
    file: UploadFile = File(...),
    current: AdminUser = Depends(get_current_admin),
):
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(400, "Only JPEG, PNG, WebP or GIF allowed")

    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else "jpg"
    filename = f"{uuid.uuid4().hex}.{ext}"
    upload_dir = app_settings.UPLOAD_DIR
    os.makedirs(upload_dir, exist_ok=True)
    path = os.path.join(upload_dir, filename)

    async with aiofiles.open(path, "wb") as f:
        content = await file.read()
        await f.write(content)

    return {"url": f"/uploads/{filename}"}


# ──────────── SETTINGS ────────────

@router.get("/settings")
def get_settings(db: Session = Depends(get_db), _: AdminUser = Depends(get_current_admin)):
    rows = db.query(SiteSettings).all()
    return [{"key": r.key, "value_ru": r.value_ru, "value_en": r.value_en} for r in rows]


@router.put("/settings")
def update_settings(body: SettingsUpdate, db: Session = Depends(get_db), _: AdminUser = Depends(get_current_admin)):
    for item in body.settings:
        row = db.query(SiteSettings).filter_by(key=item.key).first()
        if row:
            row.value_ru = item.value_ru
            row.value_en = item.value_en
        else:
            db.add(SiteSettings(key=item.key, value_ru=item.value_ru, value_en=item.value_en))
    db.commit()
    return {"ok": True}


# ──────────── EVENTS ────────────

@router.get("/events", response_model=List[EventOut])
def list_events(db: Session = Depends(get_db), _: AdminUser = Depends(get_current_admin)):
    return db.query(Event).order_by(Event.sort_order).all()


@router.post("/events", response_model=EventOut)
def create_event(body: EventCreate, db: Session = Depends(get_db), _: AdminUser = Depends(get_current_admin)):
    event = Event(**body.model_dump())
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


@router.put("/events/{event_id}", response_model=EventOut)
def update_event(event_id: int, body: EventUpdate, db: Session = Depends(get_db), _: AdminUser = Depends(get_current_admin)):
    event = db.query(Event).filter_by(id=event_id).first()
    if not event:
        raise HTTPException(404, "Not found")
    for k, v in body.model_dump().items():
        setattr(event, k, v)
    db.commit()
    db.refresh(event)
    return event


@router.delete("/events/{event_id}")
def delete_event(event_id: int, db: Session = Depends(get_db), _: AdminUser = Depends(get_current_admin)):
    event = db.query(Event).filter_by(id=event_id).first()
    if not event:
        raise HTTPException(404, "Not found")
    db.delete(event)
    db.commit()
    return {"ok": True}


# ──────────── NEWS ────────────

@router.get("/news", response_model=List[NewsOut])
def list_news(db: Session = Depends(get_db), _: AdminUser = Depends(get_current_admin)):
    return db.query(NewsArticle).order_by(NewsArticle.sort_order).all()


@router.post("/news", response_model=NewsOut)
def create_news(body: NewsCreate, db: Session = Depends(get_db), _: AdminUser = Depends(get_current_admin)):
    article = NewsArticle(**body.model_dump())
    db.add(article)
    db.commit()
    db.refresh(article)
    return article


@router.put("/news/{news_id}", response_model=NewsOut)
def update_news(news_id: int, body: NewsUpdate, db: Session = Depends(get_db), _: AdminUser = Depends(get_current_admin)):
    article = db.query(NewsArticle).filter_by(id=news_id).first()
    if not article:
        raise HTTPException(404, "Not found")
    for k, v in body.model_dump().items():
        setattr(article, k, v)
    db.commit()
    db.refresh(article)
    return article


@router.delete("/news/{news_id}")
def delete_news(news_id: int, db: Session = Depends(get_db), _: AdminUser = Depends(get_current_admin)):
    article = db.query(NewsArticle).filter_by(id=news_id).first()
    if not article:
        raise HTTPException(404, "Not found")
    db.delete(article)
    db.commit()
    return {"ok": True}


# ──────────── HALLS ────────────

@router.get("/halls", response_model=List[HallOut])
def list_halls(db: Session = Depends(get_db), _: AdminUser = Depends(get_current_admin)):
    return db.query(Hall).order_by(Hall.sort_order).all()


@router.post("/halls", response_model=HallOut)
def create_hall(body: HallCreate, db: Session = Depends(get_db), _: AdminUser = Depends(get_current_admin)):
    hall = Hall(**body.model_dump())
    db.add(hall)
    db.commit()
    db.refresh(hall)
    return hall


@router.put("/halls/{hall_id}", response_model=HallOut)
def update_hall(hall_id: int, body: HallUpdate, db: Session = Depends(get_db), _: AdminUser = Depends(get_current_admin)):
    hall = db.query(Hall).filter_by(id=hall_id).first()
    if not hall:
        raise HTTPException(404, "Not found")
    for k, v in body.model_dump().items():
        setattr(hall, k, v)
    db.commit()
    db.refresh(hall)
    return hall


@router.delete("/halls/{hall_id}")
def delete_hall(hall_id: int, db: Session = Depends(get_db), _: AdminUser = Depends(get_current_admin)):
    hall = db.query(Hall).filter_by(id=hall_id).first()
    if not hall:
        raise HTTPException(404, "Not found")
    db.delete(hall)
    db.commit()
    return {"ok": True}


# ──────────── GALLERY ────────────

@router.get("/gallery", response_model=List[GalleryOut])
def list_gallery(db: Session = Depends(get_db), _: AdminUser = Depends(get_current_admin)):
    return db.query(GalleryImage).order_by(GalleryImage.sort_order).all()


@router.post("/gallery", response_model=GalleryOut)
def create_gallery(body: GalleryCreate, db: Session = Depends(get_db), _: AdminUser = Depends(get_current_admin)):
    item = GalleryImage(**body.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.put("/gallery/{item_id}", response_model=GalleryOut)
def update_gallery(item_id: int, body: GalleryUpdate, db: Session = Depends(get_db), _: AdminUser = Depends(get_current_admin)):
    item = db.query(GalleryImage).filter_by(id=item_id).first()
    if not item:
        raise HTTPException(404, "Not found")
    for k, v in body.model_dump().items():
        setattr(item, k, v)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/gallery/{item_id}")
def delete_gallery(item_id: int, db: Session = Depends(get_db), _: AdminUser = Depends(get_current_admin)):
    item = db.query(GalleryImage).filter_by(id=item_id).first()
    if not item:
        raise HTTPException(404, "Not found")
    db.delete(item)
    db.commit()
    return {"ok": True}
