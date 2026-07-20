from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, Float, ForeignKey, LargeBinary
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class MediaFile(Base):
    """Загруженные через админку файлы хранятся в БД, а не на диске.

    Причина: контейнер гостя на awwwdde-panel не имеет постоянного volume —
    файлы на диске терялись бы при каждом редеплое. БД (Postgres) переживает
    обновления, поэтому картинки/документы кладём сюда и раздаём через
    GET /uploads/{filename}.
    """
    __tablename__ = "media_files"
    id = Column(Integer, primary_key=True)
    filename = Column(String, unique=True, nullable=False, index=True)
    content_type = Column(String, nullable=False, default="application/octet-stream")
    data = Column(LargeBinary, nullable=False)
    size = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class OrganizerRequest(Base):
    """Заявка с формы «Организаторам» (модальное окно на /organizers).

    Сохраняется в БД (чтобы ничего не терялось, даже если SMTP не настроен)
    и параллельно уходит письмом на адрес из настроек (organizers_form_email)."""
    __tablename__ = "organizer_requests"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    message = Column(Text, nullable=True)
    consent = Column(Boolean, default=False)   # согласие на обработку ПДн (152-ФЗ)
    emailed = Column(Boolean, default=False)   # удалось ли отправить письмо
    # Прикреплённый файл (PDF/DOCX): URL раздачи и оригинальное имя.
    attachment_url = Column(String, nullable=True)
    attachment_name = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class AdminUser(Base):
    __tablename__ = "admin_users"
    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    # Супер-админ: может создавать/удалять других админов. Обычные админы
    # управляют контентом, но не учётками.
    is_super = Column(Boolean, default=False)
    # Версия токенов. Кладётся в JWT при выпуске и сверяется при каждой проверке.
    # Смена/сброс пароля увеличивает счётчик — все ранее выпущенные токены
    # (в т.ч. украденный) мгновенно перестают действовать, не дожидаясь `exp`.
    token_version = Column(Integer, default=0)
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
    date = Column(String, nullable=False)          # "19 ИЮН 2026" — главная/первая дата
    date_en = Column(String, nullable=False)        # "19 JUN 2026"
    time = Column(String, nullable=False)           # "19:30"
    # Мультидаты: JSON-массив сеансов [{date, date_en, time, weekday_ru, weekday_en}].
    # Пусто/нет → одиночная дата (поля date/time выше). Заполнено → расписание
    # (напр. ёлка идёт 2 недели). Первый сеанс синхронизируется с date/time.
    dates = Column(Text, nullable=True)
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
    image = Column(String, nullable=True)              # горизонтальное — страница «Афиша»
    image_vertical = Column(String, nullable=True)     # вертикальное — карточка на главной
    is_featured = Column(Boolean, default=False)
    # Лид: на главной такое событие показывается первым в Афише.
    is_lead = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    has_ticket = Column(Boolean, default=False)
    ticket_url = Column(String, nullable=True)
    is_pinned = Column(Boolean, default=False)
    pin_order = Column(Integer, default=0)
    age_rating = Column(String, nullable=True)  # "0+", "6+", "12+", "16+", "18+"

    gallery_images = relationship("EventGalleryImage", back_populates="event", order_by="EventGalleryImage.sort_order")


class EventGalleryImage(Base):
    __tablename__ = "event_gallery_images"
    id = Column(Integer, primary_key=True)
    event_id = Column(Integer, ForeignKey("events.id", ondelete="CASCADE"), nullable=False)
    image = Column(String, nullable=False)
    caption_ru = Column(String, nullable=True)
    caption_en = Column(String, nullable=True)
    sort_order = Column(Integer, default=0)
    event = relationship("Event", back_populates="gallery_images")


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
    is_pinned = Column(Boolean, default=False)
    pin_order = Column(Integer, default=0)
    gallery = Column(Text, nullable=True)  # JSON-массив URL доп. фотографий


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
    image = Column(String, nullable=True)            # главное фото (= первое из gallery)
    gallery = Column(Text, nullable=True)            # JSON-массив URL фото для слайдера
    scheme = Column(String, nullable=True)           # (легаси) одиночная схема — = первая из schemes
    schemes = Column(Text, nullable=True)            # JSON-массив URL схем/планов для слайдера
    equipment_ru = Column(Text, nullable=True)       # (легаси) оборудование по строке на пункт
    equipment_en = Column(Text, nullable=True)
    equipment_blocks = Column(Text, nullable=True)   # JSON: [{text_ru,text_en,image}] — блоки с картинкой
    rider_only = Column(Boolean, default=False)      # показывать только в райдере (буфет, анфилада), не на странице «Залы»
    sort_order = Column(Integer, default=0)


class Review(Base):
    """Ручные отзывы, редактируются в админке."""
    __tablename__ = "reviews"
    id = Column(Integer, primary_key=True)
    author = Column(String, nullable=False)
    text = Column(Text, nullable=False)
    rating = Column(Integer, default=5)
    date_label = Column(String, nullable=True)   # напр. «11 апреля» или «Май 2026»
    is_pinned = Column(Boolean, default=False)    # закреплённые показываются первыми
    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)


class YandexReview(Base):
    """Накопитель отзывов с Яндекс Карт. Виджет отдаёт лишь ~5 свежих;
    при каждом обновлении новые (по ext_key) дописываются сюда, поэтому пул
    отзывов растёт со временем. Порядок появления = автоинкремент id."""
    __tablename__ = "yandex_reviews"
    id = Column(Integer, primary_key=True)
    author = Column(String, nullable=False)
    text = Column(Text, nullable=False)
    rating = Column(Integer, default=5)
    date_label = Column(String, nullable=True)
    ext_key = Column(String, unique=True, index=True, nullable=False)  # хэш автор+текст для дедупликации
    is_hidden = Column(Boolean, default=False)  # можно скрыть неудачный отзыв из админки


class GalleryCategory(Base):
    __tablename__ = "gallery_categories"
    id = Column(Integer, primary_key=True)
    slug = Column(String, unique=True, nullable=False)
    name_ru = Column(String, nullable=False)
    name_en = Column(String, nullable=False)
    cover_image = Column(String, nullable=True)
    cover_video = Column(String, nullable=True)  # видео-обложка блока (приоритетнее cover_image)
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
    category_id = Column(Integer, ForeignKey("gallery_categories.id"), nullable=True)
    is_video = Column(Boolean, default=False)
    video_url = Column(String, nullable=True)


class Partner(Base):
    __tablename__ = "partners"
    id = Column(Integer, primary_key=True)
    name_ru = Column(String, nullable=False)
    name_en = Column(String, nullable=False)
    logo = Column(String, nullable=True)
    url = Column(String, nullable=False, default="")
    sort_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)


# ──────────── ABOUT PAGE ────────────

class AboutHoverTip(Base):
    """Акцентная фраза в intro-тексте страницы About с прикреплённым медиа.

    Если `phrase_ru` встречается в `about_intro_text_ru` (site_settings),
    фронт оборачивает её во всплывающий popover с этим медиа.
    """
    __tablename__ = "about_hover_tips"
    id = Column(Integer, primary_key=True)
    phrase_ru = Column(String, nullable=False)
    phrase_en = Column(String, nullable=False)
    media_url = Column(String, nullable=False)
    # image / video / gif — определяет, как фронт рендерит popover
    media_type = Column(String, nullable=False, default="image")
    caption_ru = Column(String, nullable=True)
    caption_en = Column(String, nullable=True)
    sort_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)


class AboutScatteredPhoto(Base):
    """Фото из секции «случайных» фотографий со scroll-параллаксом.

    Позиции и скорости параллакса задаются админом, чтобы получить эффект
    «фотки появляются в разных местах с разной скоростью».
    """
    __tablename__ = "about_scattered_photos"
    id = Column(Integer, primary_key=True)
    image = Column(String, nullable=False)
    caption_ru = Column(String, nullable=True)
    caption_en = Column(String, nullable=True)
    # 12-колоночная сетка: с какой колонки и сколько колонок занимает (1..12)
    col_start = Column(Integer, default=1)
    col_span = Column(Integer, default=4)
    # Вертикальный сдвиг от естественной позиции в %, чтобы расположить «вразброс»
    offset_y = Column(Integer, default=0)
    # Скорость параллакса: −1..1, отрицательная = едет быстрее вверх
    parallax_speed = Column(Float, default=0.0)
    # 0..1 — какую долю прогресса секции фото должно догнать прежде чем появиться
    reveal_progress = Column(Float, default=0.0)
    sort_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)


class AboutTimelineEvent(Base):
    """Событие хронологии Дома Союзов (зигзаг-таймлайн)."""
    __tablename__ = "about_timeline_events"
    id = Column(Integer, primary_key=True)
    year = Column(String, nullable=False)        # дата/год, напр. "1784" или "Март 2026"
    tag_ru = Column(String, nullable=True)       # необязательный тег/метка события
    tag_en = Column(String, nullable=True)
    title_ru = Column(String, nullable=False)
    title_en = Column(String, nullable=False)
    description_ru = Column(Text, nullable=True)
    description_en = Column(Text, nullable=True)
    image = Column(String, nullable=True)
    sort_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
