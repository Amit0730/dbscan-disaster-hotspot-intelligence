from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List
import os

class Settings(BaseSettings):
    model_config = SettingsConfigDict(case_sensitive=True, env_file=".env", extra="ignore")

    PROJECT_NAME: str = "DBSCAN Disaster Hotspot Intelligence"
    MAPPING_ID: str = "SIH26030"
    API_V1_STR: str = "/api"
    DATABASE_URL: str = "sqlite:///./disaster_mission.db"
    UPLOAD_DIR: str = "./uploads"
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "*"]
    DEFAULT_EPS_METERS: float = 100.0
    DEFAULT_MIN_SAMPLES: int = 5

settings = Settings()
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
