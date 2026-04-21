from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # SQLite by default for zero-config local development.
    # Can be overridden with PostgreSQL URL in .env.
    DATABASE_URL: str = "sqlite:///./domsoyuzov.db"
    SECRET_KEY: str = "dev-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 1 week
    ADMIN_EMAIL: str = "admin@dom-soyuzov.ru"
    ADMIN_PASSWORD: str = "changeme"
    TEST_SUPERUSER_EMAIL: str = "superadmin@test.local"
    TEST_SUPERUSER_PASSWORD: str = "superadmin123"
    UPLOAD_DIR: str = "uploads"
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",")]

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
