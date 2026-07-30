from contextlib import asynccontextmanager
from typing import cast

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.types import ExceptionHandler
from core.config import settings
from core.exceptions import AppException, app_exception_handler, unhandled_exception_handler, validation_exception_handler

from core.database import engine, Base

from routers import trackers, habits, matrix

@asynccontextmanager
async def lifespan(_app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield

    await engine.dispose()

app = FastAPI(lifespan=lifespan)

app.add_exception_handler(AppException, app_exception_handler)
app.add_exception_handler(Exception, unhandled_exception_handler)
app.add_exception_handler(RequestValidationError, cast(ExceptionHandler, validation_exception_handler))

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.cors_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(trackers.router, prefix="/api/trackers", tags=["Trackers"])
app.include_router(habits.router, prefix="/api/habits", tags=["Habits"])
app.include_router(matrix.router, prefix="/api/trackers", tags=["Matrix"])