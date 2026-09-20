import os
from typing import List, Union
from pydantic_settings import BaseSettings
from pydantic import field_validator

class Settings(BaseSettings):
    PROJECT_NAME: str = "EduPath"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"

    # Database
    DATABASE_URL: str = "postgresql://edupath:edupath_secret_password@localhost:5432/edupath"
    FALLBACK_SQLITE_URL: str = "sqlite:///./edupath.db"

    # JWT
    JWT_SECRET_KEY: str = "edupath_super_secret_jwt_key_hackathon_2026_change_in_production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 days

    # Gemini
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.5-flash"

    # CORS
    CORS_ORIGINS: Union[str, List[str]] = ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"]

    @field_validator("CORS_ORIGINS", mode="before")
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if not v:
            return ["*"]
        if isinstance(v, str):
            v_clean = v.strip()
            if v_clean.startswith("[") and v_clean.endswith("]"):
                try:
                    import json
                    parsed = json.loads(v_clean)
                    if isinstance(parsed, list):
                        return [str(i).strip() for i in parsed]
                except Exception:
                    pass
            return [i.strip() for i in v_clean.split(",") if i.strip()]
        if isinstance(v, (list, tuple)):
            return [str(i).strip() for i in v]
        return ["*"]

    # Storage
    UPLOAD_DIR: str = "./uploads"

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
