from datetime import timedelta

from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from core.exceptions import NotFoundError, ValidationError
from models import Tracker, Day, Habit, Entry
from schemas import MatrixResponse, MatrixHabitOut, MatrixDayOut, MatrixEntryOut, EntryUpdate

MAX_APPEND_DAYS = 3650


async def get_matrix(db: AsyncSession, tracker: Tracker) -> MatrixResponse:
    habits_result = await db.execute(
        select(Habit)
        .where(Habit.tracker_id == tracker.id, Habit.archived_at.is_(None))
        .order_by(Habit.created_at)
    )
    habits = habits_result.scalars().all()
    active_habit_ids = {h.id for h in habits}

    days_result = await db.execute(
        select(Day)
        .where(Day.tracker_id == tracker.id)
        .options(selectinload(Day.entries))
        .order_by(Day.day_index)
    )
    days = days_result.scalars().all()

    day_outs = [
        MatrixDayOut(
            id=day.id,
            day_index=day.day_index,
            date=day.date,
            entries=[
                MatrixEntryOut(entry_id=e.id, habit_id=e.habit_id, completed=e.completed)
                for e in day.entries
                if e.habit_id in active_habit_ids
            ],
        )
        for day in days
    ]

    return MatrixResponse(
        tracker_id=tracker.id,
        habits=[MatrixHabitOut(id=h.id, name=h.name) for h in habits],
        days=day_outs,
    )


async def apply_entry_updates(db: AsyncSession, tracker: Tracker, updates: list[EntryUpdate]) -> None:
    if not updates:
        raise ValidationError("No updates provided.")

    entry_ids = [u.entry_id for u in updates]
    result = await db.execute(
        select(Entry).join(Day).where(Entry.id.in_(entry_ids), Day.tracker_id == tracker.id)
    )
    entries_by_id = {e.id: e for e in result.scalars().all()}

    missing = set(entry_ids) - entries_by_id.keys()
    if missing:
        raise NotFoundError(f"Entries not found on this tracker: {sorted(missing)}")

    for update in updates:
        entries_by_id[update.entry_id].completed = update.completed


async def build_appended_days(db: AsyncSession, tracker: Tracker, num_days: int) -> list[Day]:
    if num_days > MAX_APPEND_DAYS:
        raise ValidationError(f"Cannot append more than {MAX_APPEND_DAYS} days at once.")

    last_day_result = await db.execute(
        select(Day).where(Day.tracker_id == tracker.id).order_by(Day.day_index.desc()).limit(1)
    )
    last_day = last_day_result.scalar_one_or_none()
    if last_day is None:
        raise ValidationError("Tracker has no existing days to append from.")

    start_index = last_day.day_index + 1
    start_date = last_day.date + timedelta(days=1)

    new_days = [
        Day(tracker_id=tracker.id, day_index=start_index + i, date=start_date + timedelta(days=i))
        for i in range(num_days)
    ]
    db.add_all(new_days)
    await db.flush()  # need day.id for entries below

    habits_result = await db.execute(
        select(Habit).where(Habit.tracker_id == tracker.id, Habit.archived_at.is_(None))
    )
    active_habits = habits_result.scalars().all()

    entries = [Entry(day_id=day.id, habit_id=habit.id) for day in new_days for habit in active_habits]
    db.add_all(entries)

    return new_days