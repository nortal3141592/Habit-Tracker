from datetime import date, timedelta

from fastapi import HTTPException, status

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from core.exceptions import ValidationError, NotFoundError
from models import Tracker, Day, Habit, Entry, PeriodMode
from schemas import TrackerCreate

MAX_DAYS = 3650


def resolve_schedule(start_date: date, num_days: int | None, end_date: date | None) -> list[date]:
    if num_days is not None:
        total_days = num_days
    elif end_date is not None:
        total_days = (end_date - start_date).days + 1
    else:
        raise ValueError("You have to either give the number of days or the end date to continue")

    if total_days < 1:
        raise ValidationError("Resolved schedule must contain at least 1 day.")
    if total_days > MAX_DAYS:
        raise ValidationError(f"Schedule cannot exceed {MAX_DAYS} days.")

    return [start_date + timedelta(days=i) for i in range(total_days)]


async def build_tracker_with_config(db: AsyncSession, payload: TrackerCreate) -> Tracker:
    dates = resolve_schedule(payload.start_date, payload.num_days, payload.end_date)
    period_mode = PeriodMode.FIXED_DAYS if payload.num_days is not None else PeriodMode.END_DATE

    tracker = Tracker(
        name=payload.name,
        period_mode=period_mode,
        start_date=payload.start_date,
    )
    db.add(tracker)
    await db.flush()

    days = [Day(tracker_id=tracker.id, day_index=i + 1, date=d) for i, d in enumerate(dates)]
    habits = [Habit(tracker_id=tracker.id, name=name) for name in payload.initial_habit_names]
    db.add_all(days + habits)
    await db.flush()

    entries = [
        Entry(day_id=day.id, habit_id=habit.id)
        for day in days
        for habit in habits
    ]
    db.add_all(entries)

    return tracker

async def list_trackers(db: AsyncSession):
    result = await db.execute(select(Tracker).order_by(Tracker.created_at.desc()))
    trackers = result.scalars().all()

    if not trackers:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='No trackers found')

    return trackers

async def get_tracker_or_404(db: AsyncSession, tracker_id: int) -> Tracker:
    tracker = await db.get(Tracker, tracker_id)
    if tracker is None:
        raise NotFoundError(f"Tracker {tracker_id} not found")
    return tracker

async def delete_tracker(db: AsyncSession, tracker: Tracker) -> None:
    await db.delete(tracker)