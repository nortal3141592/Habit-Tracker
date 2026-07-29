from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from core.config import settings

SQLALCHEMY_DATABASE_URL = settings.db_path

engine = create_async_engine(
    SQLALCHEMY_DATABASE_URL
)

class Base(DeclarativeBase):
    pass

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session