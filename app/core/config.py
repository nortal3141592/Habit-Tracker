from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file='.env',
        env_file_encoding='utf-8'
    )

    db_path: str = "sqlite+aiosqlite:///./dev.db"
    cors_origin: str = "http://localhost:5173"

settings = Settings()