import os
from typing import List
from pydantic_settings import BaseSettings

def get_default_db_url():
    if os.getenv("VERCEL") or os.getenv("AWS_LAMBDA_FUNCTION_NAME"):
        return "sqlite:////tmp/nexusguard.db"
    return "sqlite:///./nexusguard.db"

class Settings(BaseSettings):
    PROJECT_NAME: str = "Nova Solutions - NexusGuard Platform"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "nova-solutions-nexusguard-secure-secret-key-2026-hackathon-token")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 12  # 12 hours
    
    # LLM Settings
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "auto")  # "auto", "gemini", "openai", "fallback"
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", get_default_db_url())
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "*",
    ]

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
