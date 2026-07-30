from enum import StrEnum

from fastapi import Request
from fastapi.responses import JSONResponse

import logging

logger = logging.getLogger("habit_tracker")


class ErrorCode(StrEnum):
    NOT_FOUND = "not_found"
    ALREADY_CONFIGURED = "already_configured"
    VALIDATION_ERROR = "validation_error"


class AppException(Exception):
    status_code: int = 500
    error_code: ErrorCode = ErrorCode.VALIDATION_ERROR

    def __init__(self, detail: str):
        self.detail = detail
        super().__init__(detail)


class NotFoundError(AppException):
    status_code = 404
    error_code = ErrorCode.NOT_FOUND


class AlreadyConfiguredError(AppException):
    status_code = 409
    error_code = ErrorCode.ALREADY_CONFIGURED


class ValidationError(AppException):
    status_code = 422
    error_code = ErrorCode.VALIDATION_ERROR


async def app_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    assert isinstance(exc, AppException)

    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail, "error_code": exc.error_code},
    )

async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception("Unhandled exception on %s %s", request.method, request.url.path)
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected error occurred.", "error_code": "internal_error"},
    )