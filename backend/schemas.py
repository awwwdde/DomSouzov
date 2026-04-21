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
    hall_ru: str
    hall_en: str
    tag_ru: str
    tag_en: str
    price_ru: str
    price_en: str
    description_ru: Optional[str] = None
    description_en: Optional[str] = None
    image: Optional[str] = None
    is_featured: bool = False
    is_active: bool = True
    sort_order: int = 0


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
    sort_order: int = 0


class HallCreate(HallBase):
    pass


class HallUpdate(HallBase):
    pass


class HallOut(HallBase):
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


class GalleryCreate(GalleryBase):
    pass


class GalleryUpdate(GalleryBase):
    pass


class GalleryOut(GalleryBase):
    id: int

    class Config:
        from_attributes = True
