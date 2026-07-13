from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # SQLite by default for zero-config local development.
    # Can be overridden with PostgreSQL URL in .env.
    DATABASE_URL: str = "sqlite:///./domsoyuzov.db"
    SECRET_KEY: str = "dev-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    # JWT живёт в localStorage и не отзывается, поэтому срок держим коротким
    # (сутки) — меньше окно для кражи токена. Полноценное решение — httpOnly-cookie.
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 часа

    # ── Админ ────────────────────────────────────────────────────────────────
    # Логин/пароль администратора берутся ТОЛЬКО из окружения.
    # На awwwdde-panel задаются как BOOTSTRAP_ADMIN_EMAIL / BOOTSTRAP_ADMIN_PASSWORD
    # (есть пресет в UI панели). ADMIN_EMAIL/ADMIN_PASSWORD — фолбэк для локалки.
    # env = источник истины: при старте админ создаётся, а если уже есть —
    # его пароль сбрасывается под значение из env (так «сброс через .env»).
    BOOTSTRAP_ADMIN_EMAIL: str = ""
    BOOTSTRAP_ADMIN_PASSWORD: str = ""
    ADMIN_EMAIL: str = "admin@dom-soyuzov.ru"
    ADMIN_PASSWORD: str = ""

    # Засевать ли демо-контент (события/новости/залы/галерея/about) при ПУСТОЙ БД.
    # На проде поставьте false, чтобы начать с чистого сайта.
    SEED_DEMO_CONTENT: bool = True

    # Сколько доверенных обратных прокси стоит перед приложением. 0 = не доверять
    # заголовку X-Forwarded-For (иначе его можно подделать и обойти rate-limit
    # входа). За одним прокси (напр. awwwdde-panel/nginx) поставьте 1.
    TRUSTED_PROXY_COUNT: int = 0

    UPLOAD_DIR: str = "uploads"
    # Лимиты загрузки (файлы хранятся в БД как bytea).
    MAX_UPLOAD_MB: int = 25         # картинки / PDF
    MAX_VIDEO_UPLOAD_MB: int = 300  # видео
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"
    # Публичный адрес сайта — для canonical, og:url, sitemap.xml.
    SITE_URL: str = "https://union.awwwdde.art"

    # ── SMTP (отправка заявок с формы «Организаторам») ──────────────────────
    # Транспорт берётся из окружения; получатель письма настраивается в админке
    # (ключ настройки `organizers_form_email`) с фолбэком на SMTP_TO / email_rent.
    # Если SMTP_HOST пуст — письма не шлются, но заявки всё равно сохраняются в БД.
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM: str = ""          # адрес отправителя; по умолчанию = SMTP_USER
    SMTP_TO: str = ""            # запасной получатель, если в админке не задан
    SMTP_USE_TLS: bool = True    # STARTTLS (587). Для SSL (465) поставьте False + порт 465
    SMTP_USE_SSL: bool = False   # прямой SSL-сокет (порт 465)

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",")]

    @property
    def admin_email(self) -> str:
        return (self.BOOTSTRAP_ADMIN_EMAIL or self.ADMIN_EMAIL).strip()

    @property
    def admin_password(self) -> str:
        return self.BOOTSTRAP_ADMIN_PASSWORD or self.ADMIN_PASSWORD

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()


# ── Защита от небезопасного дефолтного SECRET_KEY ────────────────────────────
# С дефолтным ключом любой может подделать JWT и войти как админ. Поэтому:
#  • прод (не-SQLite БД) — отказываемся стартовать, требуем задать SECRET_KEY;
#  • dev (SQLite) — генерируем эфемерный ключ (дефолт использовать нельзя),
#    предупреждаем; сессии сбросятся при перезапуске, пока не задан SECRET_KEY.
_DEFAULT_SECRET_KEY = "dev-secret-key-change-in-production"
if settings.SECRET_KEY == _DEFAULT_SECRET_KEY:
    import secrets as _secrets
    import sys as _sys

    _looks_like_prod = not settings.DATABASE_URL.startswith("sqlite")
    if _looks_like_prod:
        raise RuntimeError(
            "SECRET_KEY не задан — используется небезопасный дефолт. "
            "Задайте переменную окружения SECRET_KEY (например: "
            "`python -c \"import secrets; print(secrets.token_urlsafe(48))\"`) "
            "перед запуском в проде."
        )
    settings.SECRET_KEY = _secrets.token_urlsafe(48)
    print(
        "[config] ВНИМАНИЕ: SECRET_KEY не задан — сгенерирован временный ключ для dev. "
        "Токены сбросятся при перезапуске. Задайте SECRET_KEY в .env.",
        file=_sys.stderr,
    )
