"""Лёгкие миграции SQLite: ALTER COLUMN с игнорированием «duplicate column»."""
from sqlalchemy import text

from database import engine
from config import settings


def migrate_sqlite() -> None:
    if not settings.DATABASE_URL.startswith("sqlite"):
        return

    statements = [
        "ALTER TABLE events ADD COLUMN has_ticket BOOLEAN DEFAULT 0",
        "ALTER TABLE events ADD COLUMN ticket_url VARCHAR",
        "ALTER TABLE events ADD COLUMN is_pinned BOOLEAN DEFAULT 0",
        "ALTER TABLE events ADD COLUMN pin_order INTEGER DEFAULT 0",
        "ALTER TABLE news ADD COLUMN is_pinned BOOLEAN DEFAULT 0",
        "ALTER TABLE news ADD COLUMN pin_order INTEGER DEFAULT 0",
        "ALTER TABLE gallery ADD COLUMN category_id INTEGER",
        "ALTER TABLE gallery ADD COLUMN is_video BOOLEAN DEFAULT 0",
        "ALTER TABLE gallery ADD COLUMN video_url VARCHAR",
    ]

    for sql in statements:
        try:
            with engine.begin() as conn:
                conn.execute(text(sql))
        except Exception:
            pass
