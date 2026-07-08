from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


# Auth
class Token(BaseModel):
    access_token: str
    token_type: str


class LoginRequest(BaseModel):
    email: str
    password: str


# Управление админами (только супер-админ)
class AdminUserCreate(BaseModel):
    email: str
    password: str


class AdminPasswordReset(BaseModel):
    password: str


class AdminUserOut(BaseModel):
    id: int
    email: str
    is_active: bool
    is_super: bool
    created_at: datetime

    class Config:
        from_attributes = True


# Заявки с формы «Организаторам» (редактирование из админки)
class OrganizerRequestUpdate(BaseModel):
    name: str
    email: str
    phone: Optional[str] = ""
    message: Optional[str] = ""


# Site Settings
class SettingItem(BaseModel):
    key: str
    value_ru: Optional[str] = None
    value_en: Optional[str] = None


class SettingsUpdate(BaseModel):
    settings: List[SettingItem]


# Events
class EventBase(BaseModel):
    title_ru: str
    title_en: str
    date: str
    date_en: str
    time: str
    weekday_ru: str
    weekday_en: str
    # JSON-массив сеансов для мультидат; None/"" — одиночная дата.
    dates: Optional[str] = None
    hall_ru: str
    hall_en: str
    tag_ru: str
    tag_en: str
    price_ru: str
    price_en: str
    description_ru: Optional[str] = None
    description_en: Optional[str] = None
    image: Optional[str] = None
    image_vertical: Optional[str] = None
    is_featured: bool = False
    is_lead: bool = False
    is_active: bool = True
    sort_order: int = 0
    has_ticket: bool = False
    ticket_url: Optional[str] = None
    is_pinned: bool = False
    pin_order: int = 0
    age_rating: Optional[str] = None


class EventCreate(EventBase):
    pass


class EventUpdate(EventBase):
    pass


class EventOut(EventBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# News
class NewsBase(BaseModel):
    tag_ru: str
    tag_en: str
    title_ru: str
    title_en: str
    excerpt_ru: str
    excerpt_en: str
    content_ru: Optional[str] = None
    content_en: Optional[str] = None
    image: Optional[str] = None
    is_lead: bool = False
    is_active: bool = True
    sort_order: int = 0
    is_pinned: bool = False
    pin_order: int = 0
    gallery: Optional[str] = None
    # Дата/время публикации — можно задать вручную из админки.
    created_at: Optional[datetime] = None


class NewsCreate(NewsBase):
    pass


class NewsUpdate(NewsBase):
    pass


class NewsOut(NewsBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Halls
class HallBase(BaseModel):
    name_ru: str
    name_en: str
    capacity: str
    area: str
    columns: Optional[str] = None
    features_ru: str
    features_en: str
    description_ru: Optional[str] = None
    description_en: Optional[str] = None
    image: Optional[str] = None
    gallery: Optional[str] = None
    scheme: Optional[str] = None
    equipment_ru: Optional[str] = None
    equipment_en: Optional[str] = None
    rider_only: bool = False
    sort_order: int = 0


class HallCreate(HallBase):
    pass


class HallUpdate(HallBase):
    pass


class HallOut(HallBase):
    id: int

    class Config:
        from_attributes = True


# Reviews (ручные отзывы; авто с Яндекса — отдельно)
class ReviewBase(BaseModel):
    author: str
    text: str
    rating: int = 5
    date_label: Optional[str] = None
    is_pinned: bool = False
    is_active: bool = True
    sort_order: int = 0


class ReviewCreate(ReviewBase):
    pass


class ReviewUpdate(ReviewBase):
    pass


class ReviewOut(ReviewBase):
    id: int

    class Config:
        from_attributes = True


# Gallery
class GalleryBase(BaseModel):
    caption_ru: Optional[str] = None
    caption_en: Optional[str] = None
    category_ru: str = "Архитектура"
    category_en: str = "Architecture"
    image: str
    span: Optional[str] = None
    sort_order: int = 0
    is_active: bool = True
    category_id: Optional[int] = None
    is_video: bool = False
    video_url: Optional[str] = None


class GalleryCreate(GalleryBase):
    pass


class GalleryUpdate(GalleryBase):
    pass


class GalleryOut(GalleryBase):
    id: int

    class Config:
        from_attributes = True


# Gallery categories (блоки-темы)
class GalleryCategoryBase(BaseModel):
    name_ru: str
    name_en: str
    cover_image: Optional[str] = None
    sort_order: int = 0


class GalleryCategoryCreate(GalleryCategoryBase):
    slug: Optional[str] = None  # генерируется на сервере, если не задан


class GalleryCategoryUpdate(GalleryCategoryBase):
    slug: Optional[str] = None


class GalleryCategoryOut(GalleryCategoryBase):
    id: int
    slug: str

    class Config:
        from_attributes = True


# Partners
class PartnerBase(BaseModel):
    name_ru: str
    name_en: str
    logo: Optional[str] = None
    url: str = ""
    sort_order: int = 0
    is_active: bool = True


class PartnerCreate(PartnerBase):
    pass


class PartnerUpdate(PartnerBase):
    pass


class PartnerOut(PartnerBase):
    id: int

    class Config:
        from_attributes = True


# About — hover-фразы со всплывающим медиа
class AboutHoverTipBase(BaseModel):
    phrase_ru: str
    phrase_en: str
    media_url: str
    media_type: str = "image"
    caption_ru: Optional[str] = None
    caption_en: Optional[str] = None
    sort_order: int = 0
    is_active: bool = True


class AboutHoverTipCreate(AboutHoverTipBase):
    pass


class AboutHoverTipUpdate(AboutHoverTipBase):
    pass


class AboutHoverTipOut(AboutHoverTipBase):
    id: int

    class Config:
        from_attributes = True


# About — фото со scroll-параллаксом
class AboutScatteredPhotoBase(BaseModel):
    image: str
    caption_ru: Optional[str] = None
    caption_en: Optional[str] = None
    col_start: int = 1
    col_span: int = 4
    offset_y: int = 0
    parallax_speed: float = 0.0
    reveal_progress: float = 0.0
    sort_order: int = 0
    is_active: bool = True


class AboutScatteredPhotoCreate(AboutScatteredPhotoBase):
    pass


class AboutScatteredPhotoUpdate(AboutScatteredPhotoBase):
    pass


class AboutScatteredPhotoOut(AboutScatteredPhotoBase):
    id: int

    class Config:
        from_attributes = True


# About — события таймлайна
class AboutTimelineEventBase(BaseModel):
    year: str
    tag_ru: Optional[str] = None
    tag_en: Optional[str] = None
    title_ru: str
    title_en: str
    description_ru: Optional[str] = None
    description_en: Optional[str] = None
    image: Optional[str] = None
    sort_order: int = 0
    is_active: bool = True


class AboutTimelineEventCreate(AboutTimelineEventBase):
    pass


class AboutTimelineEventUpdate(AboutTimelineEventBase):
    pass


class AboutTimelineEventOut(AboutTimelineEventBase):
    id: int

    class Config:
        from_attributes = True
