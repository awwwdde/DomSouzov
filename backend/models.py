from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, Float
from sqlalchemy.sql import func
from database import Base


class AdminUser(Base):
    __tablename__ = "admin_users"
    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class SiteSettings(Base):
    __tablename__ = "site_settings"
    id = Column(Integer, primary_key=True)
    key = Column(String, unique=True, nullable=False)
    value_ru = Column(Text, nullable=True)
    value_en = Column(Text, nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class Event(Base):
    __tablename__ = "events"
    id = Column(Integer, primary_key=True)
    title_ru = Column(String, nullable=False)
    title_en = Column(String, nullable=False)
    date = Column(String, nullable=False)          # "19 ИЮН 2026"
    date_en = Column(String, nullable=False)        # "19 JUN 2026"
    time = Column(String, nullable=False)           # "19:30"
    weekday_ru = Column(String, nullable=False)     # "Пт"
    weekday_en = Column(String, nullable=False)     # "Fri"
    hall_ru = Column(String, nullable=False)
    hall_en = Column(String, nullable=False)
    tag_ru = Column(String, nullable=False)
    tag_en = Column(String, nullable=False)
    price_ru = Column(String, nullable=False)
    price_en = Column(String, nullable=False)
    description_ru = Column(Text, nullable=True)
    description_en = Column(Text, nullable=True)
    image = Column(String, nullable=True)
    is_featured = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class NewsArticle(Base):
    __tablename__ = "news"
    id = Column(Integer, primary_key=True)
    tag_ru = Column(String, nullable=False)
    tag_en = Column(String, nullable=False)
    title_ru = Column(String, nullable=False)
    title_en = Column(String, nullable=False)
    excerpt_ru = Column(Text, nullable=False)
    excerpt_en = Column(Text, nullable=False)
    content_ru = Column(Text, nullable=True)
    content_en = Column(Text, nullable=True)
    image = Column(String, nullable=True)
    is_lead = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Hall(Base):
    __tablename__ = "halls"
    id = Column(Integer, primary_key=True)
    name_ru = Column(String, nullable=False)
    name_en = Column(String, nullable=False)
    capacity = Column(String, nullable=False)
    area = Column(String, nullable=False)
    columns = Column(String, nullable=True)
    features_ru = Column(String, nullable=False)
    features_en = Column(String, nullable=False)
    description_ru = Column(Text, nullable=True)
    description_en = Column(Text, nullable=True)
    image = Column(String, nullable=True)
    sort_order = Column(Integer, default=0)


class GalleryImage(Base):
    __tablename__ = "gallery"
    id = Column(Integer, primary_key=True)
    caption_ru = Column(String, nullable=True)
    caption_en = Column(String, nullable=True)
    category_ru = Column(String, nullable=False, default="Архитектура")
    category_en = Column(String, nullable=False, default="Architecture")
    image = Column(String, nullable=False)
    span = Column(String, nullable=True)  # "span2", "span2h", etc.
    sort_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
