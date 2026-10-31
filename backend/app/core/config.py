"""
Business Voice AI - Core Configuration
"""
from pydantic_settings import BaseSettings
from typing import Optional
import os


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "BusinessVoiceAI"
    APP_ENV: str = "development"
    SECRET_KEY: str = "dev-secret-key-change-me"
    DEBUG: bool = True

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./business_voice.db"
    DATABASE_SYNC_URL: str = "sqlite:///./business_voice.db"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # JWT
    JWT_SECRET_KEY: str = "jwt-secret-change-me"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Groq / xAI LLM
    GROQ_API_KEY: Optional[str] = None
    GROQ_API_BASE_URL: str = "https://api.groq.com/openai/v1"
    GROQ_MODEL: str = "openai/gpt-oss-120b"

    XAI_API_KEY: Optional[str] = None
    XAI_API_BASE_URL: str = "https://api.x.ai/v1"
    XAI_MODEL: str = "grok-3-latest"

    # Bolna AI
    BOLNA_API_KEY: Optional[str] = None
    BOLNA_API_BASE_URL: str = "https://api.bolna.ai"
    BOLNA_WEBHOOK_SECRET: Optional[str] = None

    # CORS
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000"

    # Demo Mode
    DEMO_MODE: bool = False

    @property
    def is_demo_mode(self) -> bool:
        """Returns True if demo mode is active (no real API keys configured)."""
        if self.DEMO_MODE:
            return True
        has_llm = bool(self.GROQ_API_KEY or self.XAI_API_KEY)
        has_bolna = bool(self.BOLNA_API_KEY)
        return not (has_llm or has_bolna)

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    class Config:
        env_file = [".env", "../.env", "backend/.env"]
        extra = "ignore"
        case_sensitive = True


settings = Settings()

