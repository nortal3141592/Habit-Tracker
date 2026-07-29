from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from schemas import HabitCreate, HabitResponse
from utils.tracker_utils import get_tracker_or_404
from utils.habit_utils import build_habit_with_backfill, get_habit_or_404, archive_habit

router = APIRouter()


@router.post("/{tracker_id}/habits", response_model=HabitResponse, status_code=status.HTTP_201_CREATED)
async def create_habit(tracker_id: int, payload: HabitCreate, db: AsyncSession = Depends(get_db)):
    tracker = await get_tracker_or_404(db, tracker_id)
    habit = await build_habit_with_backfill(db, tracker, payload)

    await db.commit()
    await db.refresh(habit)
    
    return habit


@router.delete("/{tracker_id}/habits/{habit_id}", response_model=HabitResponse)
async def remove_habit(tracker_id: int, habit_id: int, db: AsyncSession = Depends(get_db)):
    habit = await get_habit_or_404(db, tracker_id, habit_id)
    habit = await archive_habit(db, habit)

    await db.commit()
    await db.refresh(habit)

    return habit