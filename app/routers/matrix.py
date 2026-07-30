from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from schemas import MatrixResponse, MatrixUpdateRequest, DayAppendRequest, DayResponse
from utils.tracker_utils import get_tracker_or_404
from utils.matrix_utils import get_matrix, apply_entry_updates, build_appended_days

router = APIRouter()


@router.get("/{tracker_id}/matrix", response_model=MatrixResponse)
async def read_matrix(tracker_id: int, db: AsyncSession = Depends(get_db)):
    tracker = await get_tracker_or_404(db, tracker_id)
    return await get_matrix(db, tracker)


@router.patch("/{tracker_id}/matrix", response_model=MatrixResponse)
async def update_matrix(tracker_id: int, payload: MatrixUpdateRequest, db: AsyncSession = Depends(get_db)):
    tracker = await get_tracker_or_404(db, tracker_id)
    await apply_entry_updates(db, tracker, payload.updates)
    await db.commit()
    return await get_matrix(db, tracker)


@router.post("/{tracker_id}/days", response_model=list[DayResponse], status_code=status.HTTP_201_CREATED)
async def append_days(tracker_id: int, payload: DayAppendRequest, db: AsyncSession = Depends(get_db)):
    tracker = await get_tracker_or_404(db, tracker_id)
    days = await build_appended_days(db, tracker, payload.num_days)
    await db.commit()
    for day in days:
        await db.refresh(day)
    return days