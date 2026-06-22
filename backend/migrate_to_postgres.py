"""Перенос данных из локального SQLite в PostgreSQL.

Использование (из каталога backend, при активном venv):

    # 1. источник — текущий SQLite, цель — прод-Postgres
    set SOURCE_DATABASE_URL=sqlite:///./domsoyuzov.db
    set TARGET_DATABASE_URL=postgresql+psycopg2://domuser:PASS@host:5432/domsoyuzov
    python migrate_to_postgres.py

Скрипт создаёт схему в целевой БД (Base.metadata.create_all) и копирует
все строки таблица-за-таблицей в порядке зависимостей. Идемпотентность не
гарантируется — выполняйте на ПУСТОЙ целевой БД (иначе будут дубли/конфликты
первичных ключей). После переноса не забудьте выровнять sequence у Postgres
(скрипт делает это автоматически для всех таблиц с числовым id).
"""
import os
import sys

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from database import Base  # noqa: E402
import models  # noqa: E402,F401  — регистрирует все модели в Base.metadata

# Порядок важен: сперва таблицы без внешних ключей, затем зависимые.
ORDERED_MODELS = [
    models.MediaFile,                # ВАЖНО: все загруженные файлы (картинки/PDF/видео)
    models.NewsletterSubscriber,     # подписчики из формы в футере
    models.AdminUser,
    models.SiteSettings,
    models.Event,
    models.EventGalleryImage,        # FK → events
    models.NewsArticle,
    models.Hall,
    models.GalleryCategory,
    models.GalleryImage,             # FK → gallery_categories
    models.Partner,
    models.AboutHoverTip,
    models.AboutScatteredPhoto,
    models.AboutTimelineEvent,
]


def main() -> None:
    source_url = os.environ.get("SOURCE_DATABASE_URL", "sqlite:///./domsoyuzov.db")
    target_url = os.environ.get("TARGET_DATABASE_URL")
    if not target_url:
        print("ERROR: задайте TARGET_DATABASE_URL (Postgres).", file=sys.stderr)
        sys.exit(1)

    src_kwargs = {"connect_args": {"check_same_thread": False}} if source_url.startswith("sqlite") else {}
    src_engine = create_engine(source_url, **src_kwargs)
    dst_engine = create_engine(target_url)

    print(f"Источник: {source_url}")
    print(f"Цель:     {target_url}")

    Base.metadata.create_all(bind=dst_engine)

    SrcSession = sessionmaker(bind=src_engine)
    DstSession = sessionmaker(bind=dst_engine)
    src = SrcSession()
    dst = DstSession()

    try:
        for model in ORDERED_MODELS:
            rows = src.query(model).all()
            count = 0
            for row in rows:
                data = {c.name: getattr(row, c.name) for c in model.__table__.columns}
                dst.merge(model(**data))
                count += 1
            dst.commit()
            print(f"  {model.__tablename__}: перенесено {count}")

        # Выравниваем sequence в Postgres, чтобы новые вставки не конфликтовали.
        if target_url.startswith("postgresql"):
            for model in ORDERED_MODELS:
                table = model.__tablename__
                if "id" in model.__table__.columns:
                    dst.execute(text(
                        f"SELECT setval(pg_get_serial_sequence('{table}', 'id'), "
                        f"COALESCE((SELECT MAX(id) FROM {table}), 1), true)"
                    ))
            dst.commit()
            print("Sequence выровнены.")

        print("Готово.")
    finally:
        src.close()
        dst.close()


if __name__ == "__main__":
    main()
