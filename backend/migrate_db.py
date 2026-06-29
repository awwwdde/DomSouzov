"""Лёгкие миграции: идемпотентно добавляют недостающие колонки.

Работает и на SQLite, и на PostgreSQL. `Base.metadata.create_all` создаёт
только отсутствующие ТАБЛИЦЫ, но не добавляет новые КОЛОНКИ в уже
существующие — поэтому при добавлении полей в модели нужно прогонять это.
"""
from sqlalchemy import text

from database import engine
from config import settings


def migrate_sqlite() -> None:
    is_sqlite = settings.DATABASE_URL.startswith("sqlite")
    bool_default = "BOOLEAN DEFAULT 0" if is_sqlite else "BOOLEAN DEFAULT FALSE"

    columns = [
        ("events", "has_ticket", bool_default),
        ("events", "ticket_url", "VARCHAR"),
        ("events", "is_pinned", bool_default),
        ("events", "pin_order", "INTEGER DEFAULT 0"),
        ("events", "age_rating", "VARCHAR"),
        ("events", "image_vertical", "VARCHAR"),
        ("events", "is_lead", bool_default),
        ("events", "dates", "TEXT"),
        ("news", "is_pinned", bool_default),
        ("news", "pin_order", "INTEGER DEFAULT 0"),
        ("news", "gallery", "TEXT"),
        ("gallery", "category_id", "INTEGER"),
        ("gallery", "is_video", bool_default),
        ("gallery", "video_url", "VARCHAR"),
        ("about_timeline_events", "tag_ru", "VARCHAR"),
        ("about_timeline_events", "tag_en", "VARCHAR"),
        ("admin_users", "is_super", bool_default),
        ("halls", "gallery", "TEXT"),
        ("organizer_requests", "attachment_url", "VARCHAR"),
        ("organizer_requests", "attachment_name", "VARCHAR"),
    ]

    for table, col, coltype in columns:
        if is_sqlite:
            # SQLite не поддерживает IF NOT EXISTS для ADD COLUMN — ловим ошибку.
            sql = f"ALTER TABLE {table} ADD COLUMN {col} {coltype}"
        else:
            sql = f"ALTER TABLE {table} ADD COLUMN IF NOT EXISTS {col} {coltype}"
        try:
            with engine.begin() as conn:
                conn.execute(text(sql))
        except Exception:
            pass
