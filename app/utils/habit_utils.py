from datetime import datetime, UTC

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.exceptions import NotFoundError, ValidationError
from models import Tracker, Day, Habit, Entry
from schemas import HabitCreate


async def build_habit_with_backfill(db: AsyncSession, tracker: Tracker, payload: HabitCreate) -> Habit:
    result = await db.execute(
        select(Habit).where(
            Habit.tracker_id == tracker.id,
            Habit.name == payload.name,
            Habit.archived_at.is_(None),
        )
    )
    if result.scalar_one_or_none() is not None:
        raise ValidationError(f"Habit '{payload.name}' already exists on this tracker.")

    habit = Habit(tracker_id=tracker.id, name=payload.name)
    db.add(habit)
    await db.flush()

    result = await db.execute(select(Day).where(Day.tracker_id == tracker.id))
    existing_days = result.scalars().all()

    entries = [Entry(day_id=day.id, habit_id=habit.id) for day in existing_days]
    db.add_all(entries)

    return habit


async def get_habit_or_404(db: AsyncSession, tracker_id: int, habit_id: int) -> Habit:
    habit = await db.get(Habit, habit_id)
    if habit is None or habit.tracker_id != tracker_id:
        raise NotFoundError(f"Habit {habit_id} not found on tracker {tracker_id}")
    return habit


async def archive_habit(db: AsyncSession, habit: Habit) -> Habit:
    if habit.archived_at is not None:
        raise ValidationError(f"Habit {habit.id} is already archived.")
    habit.archived_at = datetime.now(UTC)

    return habit