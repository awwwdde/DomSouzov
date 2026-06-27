"""Admin CRUD API endpoints (JWT-protected)."""
import os
import re
import time
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import (
    AdminUser,
    SiteSettings,
    Event,
    NewsArticle,
    Hall,
    GalleryImage,
    GalleryCategory,
    Partner,
    AboutHoverTip,
    AboutScatteredPhoto,
    AboutTimelineEvent,
    MediaFile,
    NewsletterSubscriber,
    OrganizerRequest,
)
from schemas import (
    Token, LoginRequest,
    SettingsUpdate, SettingItem,
    EventCreate, EventUpdate, EventOut,
    NewsCreate, NewsUpdate, NewsOut,
    HallCreate, HallUpdate, HallOut,
    GalleryCreate, GalleryUpdate, GalleryOut,
    GalleryCategoryCreate, GalleryCategoryUpdate, GalleryCategoryOut,
    PartnerCreate, PartnerUpdate, PartnerOut,
    AboutHoverTipCreate, AboutHoverTipUpdate, AboutHoverTipOut,
    AboutScatteredPhotoCreate, AboutScatteredPhotoUpdate, AboutScatteredPhotoOut,
    AboutTimelineEventCreate, AboutTimelineEventUpdate, AboutTimelineEventOut,
)
from auth import verify_password, create_access_token, get_current_admin, get_current_super_admin, hash_password
from schemas import AdminUserCreate, AdminUserOut, AdminPasswordReset, OrganizerRequestUpdate
from config import settings as app_settings
import aiofiles

router = APIRouter(prefix="/api/admin", tags=["admin"])

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
ALLOWED_VIDEO_TYPES = {
    "video/mp4",
    "video/webm",
    "video/ogg",
    "video/quicktime",
    "video/x-msvideo",
    "video/x-matroska",
    "video/x-m4v",
    "application/mp4",
}
ALLOWED_DOC_TYPES = {"application/pdf"}
ALLOWED_IMAGE_EXTENSIONS = {"jpg", "jpeg", "png", "webp", "gif"}
ALLOWED_VIDEO_EXTENSIONS = {"mp4", "webm", "ogg", "mov", "m4v", "avi", "mkv"}
ALLOWED_DOC_EXTENSIONS = {"pdf"}


# ──────────── AUTH ────────────

# Простой in-memory rate-limit на вход: защита от перебора пароля.
# Хранит метки времени неудачных попыток по IP. Сбрасывается при рестарте —
# для одного инстанса этого достаточно; для кластера нужен общий стор (Redis).
_LOGIN_ATTEMPTS: dict = {}
_LOGIN_MAX_ATTEMPTS = 7          # попыток за окно
_LOGIN_WINDOW_SEC = 15 * 60      # окно блокировки, сек


def _client_ip(request: Request) -> str:
    fwd = request.headers.get("x-forwarded-for")
    if fwd:
        return fwd.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


@router.post("/login", response_model=Token)
def login(form: LoginRequest, request: Request, db: Session = Depends(get_db)):
    ip = _client_ip(request)
    now = time.time()
    attempts = [t for t in _LOGIN_ATTEMPTS.get(ip, []) if now - t < _LOGIN_WINDOW_SEC]
    if len(attempts) >= _LOGIN_MAX_ATTEMPTS:
        raise HTTPException(429, "Слишком много попыток входа. Повторите через несколько минут.")

    user = db.query(AdminUser).filter(AdminUser.email == form.email).first()
    if not user or not verify_password(form.password, user.hashed_password):
        attempts.append(now)
        _LOGIN_ATTEMPTS[ip] = attempts
        raise HTTPException(401, "Incorrect email or password")

    _LOGIN_ATTEMPTS.pop(ip, None)  # успешный вход — сбрасываем счётчик
    token = create_access_token({"sub": user.email})
    return {"access_token": token, "token_type": "bearer"}


@router.get("/me")
def get_me(current: AdminUser = Depends(get_current_admin)):
    return {"email": current.email, "id": current.id, "is_super": bool(getattr(current, "is_super", False))}


# ──────────── ADMINS (только супер-админ) ────────────

@router.get("/admins", response_model=List[AdminUserOut])
def list_admins(db: Session = Depends(get_db), _: AdminUser = Depends(get_current_super_admin)):
    return db.query(AdminUser).order_by(AdminUser.created_at).all()


@router.post("/admins", response_model=AdminUserOut)
def create_admin(body: AdminUserCreate, db: Session = Depends(get_db), _: AdminUser = Depends(get_current_super_admin)):
    email = (body.email or "").strip().lower()
    if not email or "@" not in email:
        raise HTTPException(400, "Некорректный email")
    if len(body.password or "") < 6:
        raise HTTPException(400, "Пароль должен быть не короче 6 символов")
    if db.query(AdminUser).filter(AdminUser.email == email).first():
        raise HTTPException(409, "Админ с таким email уже существует")
    user = AdminUser(email=email, hashed_password=hash_password(body.password), is_active=True, is_super=False)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/admins/{admin_id}/reset-password")
def reset_admin_password(admin_id: int, body: AdminPasswordReset, db: Session = Depends(get_db), _: AdminUser = Depends(get_current_super_admin)):
    user = db.query(AdminUser).filter_by(id=admin_id).first()
    if not user:
        raise HTTPException(404, "Не найдено")
    if len(body.password or "") < 6:
        raise HTTPException(400, "Пароль должен быть не короче 6 символов")
    user.hashed_password = hash_password(body.password)
    db.commit()
    return {"ok": True}


@router.delete("/admins/{admin_id}")
def delete_admin(admin_id: int, db: Session = Depends(get_db), current: AdminUser = Depends(get_current_super_admin)):
    user = db.query(AdminUser).filter_by(id=admin_id).first()
    if not user:
        raise HTTPException(404, "Не найдено")
    if user.id == current.id:
        raise HTTPException(400, "Нельзя удалить самого себя")
    if user.is_super:
        raise HTTPException(400, "Нельзя удалить супер-админа")
    db.delete(user)
    db.commit()
    return {"ok": True}


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
async def upload_file(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current: AdminUser = Depends(get_current_admin),
):
    ext = file.filename.rsplit(".", 1)[-1].lower() if file.filename and "." in file.filename else "bin"
    is_known_mime = (
        file.content_type in ALLOWED_IMAGE_TYPES
        or file.content_type in ALLOWED_VIDEO_TYPES
        or file.content_type in ALLOWED_DOC_TYPES
    )
    is_known_ext = (
        ext in ALLOWED_IMAGE_EXTENSIONS
        or ext in ALLOWED_VIDEO_EXTENSIONS
        or ext in ALLOWED_DOC_EXTENSIONS
    )
    is_octet_stream = file.content_type == "application/octet-stream"

    if not is_known_mime and not (is_known_ext and is_octet_stream) and not is_known_ext:
        raise HTTPException(
            400,
            "Unsupported file type. Allowed images: JPEG/PNG/WebP/GIF. "
            "Videos: MP4/WebM/OGG/MOV/M4V/AVI/MKV. Documents: PDF",
        )

    # Лимит размера — ДО чтения в память (файлы лежат в БД как bytea).
    is_video_ext = ext in ALLOWED_VIDEO_EXTENSIONS or (file.content_type in ALLOWED_VIDEO_TYPES)
    limit_mb = app_settings.MAX_VIDEO_UPLOAD_MB if is_video_ext else app_settings.MAX_UPLOAD_MB
    max_bytes = limit_mb * 1024 * 1024
    declared = getattr(file, "size", None)
    if declared and declared > max_bytes:
        raise HTTPException(
            413,
            f"Файл слишком большой ({declared // (1024 * 1024)} МБ). Максимум — {limit_mb} МБ.",
        )

    content = await file.read()
    if len(content) > max_bytes:
        raise HTTPException(
            413,
            f"Файл слишком большой ({len(content) // (1024 * 1024)} МБ). Максимум — {limit_mb} МБ.",
        )
    filename = f"{uuid.uuid4().hex}.{ext}"
    content_type = file.content_type or "application/octet-stream"

    # Храним в БД — переживает редеплой (у гостя панели нет постоянного диска).
    db.add(
        MediaFile(
            filename=filename,
            content_type=content_type,
            data=content,
            size=len(content),
        )
    )
    db.commit()

    return {"url": f"/uploads/{filename}"}


# ──────────── NEWSLETTER ────────────

@router.get("/subscribers")
def list_subscribers(db: Session = Depends(get_db), _: AdminUser = Depends(get_current_admin)):
    rows = db.query(NewsletterSubscriber).order_by(NewsletterSubscriber.created_at.desc()).all()
    return [
        {"id": r.id, "email": r.email, "created_at": r.created_at.isoformat() if r.created_at else None}
        for r in rows
    ]


# ──────────── ORGANIZER REQUESTS (заявки с формы «Организаторам») ────────────

def _organizer_request_out(r: OrganizerRequest) -> dict:
    return {
        "id": r.id,
        "name": r.name,
        "email": r.email,
        "phone": r.phone,
        "message": r.message,
        "emailed": bool(r.emailed),
        "created_at": r.created_at.isoformat() if r.created_at else None,
    }


@router.get("/organizer-requests")
def list_organizer_requests(db: Session = Depends(get_db), _: AdminUser = Depends(get_current_admin)):
    rows = db.query(OrganizerRequest).order_by(OrganizerRequest.created_at.desc()).all()
    return [_organizer_request_out(r) for r in rows]


@router.put("/organizer-requests/{req_id}")
def update_organizer_request(req_id: int, body: OrganizerRequestUpdate, db: Session = Depends(get_db), _: AdminUser = Depends(get_current_admin)):
    r = db.query(OrganizerRequest).filter_by(id=req_id).first()
    if not r:
        raise HTTPException(404, "Not found")
    r.name = (body.name or "").strip()
    r.email = (body.email or "").strip()
    r.phone = (body.phone or "").strip()
    r.message = (body.message or "").strip()
    db.commit()
    db.refresh(r)
    return _organizer_request_out(r)


@router.delete("/organizer-requests/{req_id}")
def delete_organizer_request(req_id: int, db: Session = Depends(get_db), _: AdminUser = Depends(get_current_admin)):
    r = db.query(OrganizerRequest).filter_by(id=req_id).first()
    if not r:
        raise HTTPException(404, "Not found")
    db.delete(r)
    db.commit()
    return {"ok": True}


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
    data = body.model_dump()
    # Если дата не задана — пусть применится server_default (текущее время).
    if data.get("created_at") is None:
        data.pop("created_at", None)
    article = NewsArticle(**data)
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
        if k == "created_at" and v is None:
            continue  # не затираем дату, если её не прислали
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


# ──────────── GALLERY CATEGORIES (блоки-темы) ────────────

_TRANSLIT = {
    "а": "a", "б": "b", "в": "v", "г": "g", "д": "d", "е": "e", "ё": "e",
    "ж": "zh", "з": "z", "и": "i", "й": "y", "к": "k", "л": "l", "м": "m",
    "н": "n", "о": "o", "п": "p", "р": "r", "с": "s", "т": "t", "у": "u",
    "ф": "f", "х": "h", "ц": "c", "ч": "ch", "ш": "sh", "щ": "sch",
    "ъ": "", "ы": "y", "ь": "", "э": "e", "ю": "yu", "я": "ya",
}


def _slugify(text: str) -> str:
    s = (text or "").strip().lower()
    out = "".join(_TRANSLIT.get(ch, ch) for ch in s)
    out = re.sub(r"[^a-z0-9]+", "-", out).strip("-")
    return out or f"tema-{uuid.uuid4().hex[:6]}"


@router.get("/gallery-categories", response_model=List[GalleryCategoryOut])
def list_gallery_categories(db: Session = Depends(get_db), _: AdminUser = Depends(get_current_admin)):
    return db.query(GalleryCategory).order_by(GalleryCategory.sort_order).all()


@router.post("/gallery-categories", response_model=GalleryCategoryOut)
def create_gallery_category(body: GalleryCategoryCreate, db: Session = Depends(get_db), _: AdminUser = Depends(get_current_admin)):
    data = body.model_dump()
    slug = (data.get("slug") or "").strip() or _slugify(data.get("name_ru") or data.get("name_en"))
    # уникальность slug
    base, i = slug, 2
    while db.query(GalleryCategory).filter_by(slug=slug).first():
        slug = f"{base}-{i}"
        i += 1
    data["slug"] = slug
    cat = GalleryCategory(**data)
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat


@router.put("/gallery-categories/{cat_id}", response_model=GalleryCategoryOut)
def update_gallery_category(cat_id: int, body: GalleryCategoryUpdate, db: Session = Depends(get_db), _: AdminUser = Depends(get_current_admin)):
    cat = db.query(GalleryCategory).filter_by(id=cat_id).first()
    if not cat:
        raise HTTPException(404, "Not found")
    for k, v in body.model_dump().items():
        if k == "slug" and not (v or "").strip():
            continue  # пустой slug не затираем
        setattr(cat, k, v)
    db.commit()
    db.refresh(cat)
    return cat


@router.delete("/gallery-categories/{cat_id}")
def delete_gallery_category(cat_id: int, db: Session = Depends(get_db), _: AdminUser = Depends(get_current_admin)):
    cat = db.query(GalleryCategory).filter_by(id=cat_id).first()
    if not cat:
        raise HTTPException(404, "Not found")
    # фотографии этой темы тоже удаляем (блок с фотками)
    db.query(GalleryImage).filter(GalleryImage.category_id == cat_id).delete(synchronize_session=False)
    db.delete(cat)
    db.commit()
    return {"ok": True}


# ──────────── PARTNERS ────────────

@router.get("/partners", response_model=List[PartnerOut])
def list_partners(db: Session = Depends(get_db), _: AdminUser = Depends(get_current_admin)):
    return db.query(Partner).order_by(Partner.sort_order).all()


@router.post("/partners", response_model=PartnerOut)
def create_partner(body: PartnerCreate, db: Session = Depends(get_db), _: AdminUser = Depends(get_current_admin)):
    p = Partner(**body.model_dump())
    db.add(p)
    db.commit()
    db.refresh(p)
    return p


@router.put("/partners/{partner_id}", response_model=PartnerOut)
def update_partner(partner_id: int, body: PartnerUpdate, db: Session = Depends(get_db), _: AdminUser = Depends(get_current_admin)):
    p = db.query(Partner).filter_by(id=partner_id).first()
    if not p:
        raise HTTPException(404, "Not found")
    for k, v in body.model_dump().items():
        setattr(p, k, v)
    db.commit()
    db.refresh(p)
    return p


@router.delete("/partners/{partner_id}")
def delete_partner(partner_id: int, db: Session = Depends(get_db), _: AdminUser = Depends(get_current_admin)):
    p = db.query(Partner).filter_by(id=partner_id).first()
    if not p:
        raise HTTPException(404, "Not found")
    db.delete(p)
    db.commit()
    return {"ok": True}


# ──────────── ABOUT · HOVER TIPS ────────────

@router.get("/about/hover-tips", response_model=List[AboutHoverTipOut])
def list_about_tips(db: Session = Depends(get_db), _: AdminUser = Depends(get_current_admin)):
    return db.query(AboutHoverTip).order_by(AboutHoverTip.sort_order).all()


@router.post("/about/hover-tips", response_model=AboutHoverTipOut)
def create_about_tip(body: AboutHoverTipCreate, db: Session = Depends(get_db), _: AdminUser = Depends(get_current_admin)):
    item = AboutHoverTip(**body.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.put("/about/hover-tips/{tip_id}", response_model=AboutHoverTipOut)
def update_about_tip(tip_id: int, body: AboutHoverTipUpdate, db: Session = Depends(get_db), _: AdminUser = Depends(get_current_admin)):
    item = db.query(AboutHoverTip).filter_by(id=tip_id).first()
    if not item:
        raise HTTPException(404, "Not found")
    for k, v in body.model_dump().items():
        setattr(item, k, v)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/about/hover-tips/{tip_id}")
def delete_about_tip(tip_id: int, db: Session = Depends(get_db), _: AdminUser = Depends(get_current_admin)):
    item = db.query(AboutHoverTip).filter_by(id=tip_id).first()
    if not item:
        raise HTTPException(404, "Not found")
    db.delete(item)
    db.commit()
    return {"ok": True}


# ──────────── ABOUT · SCATTERED PHOTOS ────────────

@router.get("/about/photos", response_model=List[AboutScatteredPhotoOut])
def list_about_photos(db: Session = Depends(get_db), _: AdminUser = Depends(get_current_admin)):
    return db.query(AboutScatteredPhoto).order_by(AboutScatteredPhoto.sort_order).all()


@router.post("/about/photos", response_model=AboutScatteredPhotoOut)
def create_about_photo(body: AboutScatteredPhotoCreate, db: Session = Depends(get_db), _: AdminUser = Depends(get_current_admin)):
    item = AboutScatteredPhoto(**body.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.put("/about/photos/{photo_id}", response_model=AboutScatteredPhotoOut)
def update_about_photo(photo_id: int, body: AboutScatteredPhotoUpdate, db: Session = Depends(get_db), _: AdminUser = Depends(get_current_admin)):
    item = db.query(AboutScatteredPhoto).filter_by(id=photo_id).first()
    if not item:
        raise HTTPException(404, "Not found")
    for k, v in body.model_dump().items():
        setattr(item, k, v)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/about/photos/{photo_id}")
def delete_about_photo(photo_id: int, db: Session = Depends(get_db), _: AdminUser = Depends(get_current_admin)):
    item = db.query(AboutScatteredPhoto).filter_by(id=photo_id).first()
    if not item:
        raise HTTPException(404, "Not found")
    db.delete(item)
    db.commit()
    return {"ok": True}


# ──────────── ABOUT · TIMELINE EVENTS ────────────

@router.get("/about/timeline", response_model=List[AboutTimelineEventOut])
def list_about_timeline(db: Session = Depends(get_db), _: AdminUser = Depends(get_current_admin)):
    return db.query(AboutTimelineEvent).order_by(AboutTimelineEvent.sort_order).all()


@router.post("/about/timeline", response_model=AboutTimelineEventOut)
def create_about_timeline(body: AboutTimelineEventCreate, db: Session = Depends(get_db), _: AdminUser = Depends(get_current_admin)):
    item = AboutTimelineEvent(**body.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.put("/about/timeline/{event_id}", response_model=AboutTimelineEventOut)
def update_about_timeline(event_id: int, body: AboutTimelineEventUpdate, db: Session = Depends(get_db), _: AdminUser = Depends(get_current_admin)):
    item = db.query(AboutTimelineEvent).filter_by(id=event_id).first()
    if not item:
        raise HTTPException(404, "Not found")
    for k, v in body.model_dump().items():
        setattr(item, k, v)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/about/timeline/{event_id}")
def delete_about_timeline(event_id: int, db: Session = Depends(get_db), _: AdminUser = Depends(get_current_admin)):
    item = db.query(AboutTimelineEvent).filter_by(id=event_id).first()
    if not item:
        raise HTTPException(404, "Not found")
    db.delete(item)
    db.commit()
    return {"ok": True}
