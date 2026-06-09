from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # SQLite by default for zero-config local development.
    # Can be overridden with PostgreSQL URL in .env.
    DATABASE_URL: str = "sqlite:///./domsoyuzov.db"
    SECRET_KEY: str = "dev-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 1 week

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

    UPLOAD_DIR: str = "uploads"
    # Лимит загрузки файла в МБ. Файлы хранятся в БД (bytea), поэтому большие
    # видео заливать сюда не стоит — для видео используйте внешнюю ссылку (URL).
    MAX_UPLOAD_MB: int = 25
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"
    # Публичный адрес сайта — для canonical, og:url, sitemap.xml.
    SITE_URL: str = "https://union.awwwdde.art"

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
