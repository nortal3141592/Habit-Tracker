from __future__ import annotations

from datetime import date, datetime, UTC
from enum import StrEnum

from sqlalchemy import String, Date, DateTime, Boolean, func, Integer, UniqueConstraint, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import Base


class PeriodMode(StrEnum):
    FIXED_DAYS = "fixed_days"
    END_DATE = "end_date"


class Tracker(Base):
    __tablename__ = "trackers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, nullable=False)

    period_mode: Mapped[PeriodMode] = mapped_column(nullable=False)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default= lambda: datetime.now(UTC))

    days: Mapped[list[Day]] = relationship(back_populates="tracker", cascade="all, delete-orphan")
    habits: Mapped[list[Habit]] = relationship(back_populates="tracker", cascade="all, delete-orphan")


class Day(Base):
    __tablename__ = "days"
    __table_args__ = (UniqueConstraint("tracker_id", "day_index"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    tracker_id: Mapped[int] = mapped_column(ForeignKey("trackers.id"))

    day_index: Mapped[int] = mapped_column(Integer)
    date: Mapped[date] = mapped_column(Date)

    tracker: Mapped[Tracker] = relationship(back_populates="days")
    entries: Mapped[list["Entry"]] = relationship(back_populates="day", cascade="all, delete-orphan")

class Habit(Base):
    __tablename__ = "habits"
    __table_args__ = (UniqueConstraint("tracker_id", "name"), )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    tracker_id: Mapped[int] = mapped_column(ForeignKey("trackers.id"))
    name: Mapped[str] = mapped_column(String, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default= lambda: datetime.now(UTC))
    archived_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True, default=None)

    tracker: Mapped[Tracker] = relationship(back_populates="habits")
    entries: Mapped[list[Entry]] = relationship(back_populates="habit", cascade='all, delete-orphan')

    

class Entry(Base):
    __tablename__ = "entries"
    __table_args__ = (UniqueConstraint("day_id", "habit_id"), )


    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    day_id: Mapped[int] = mapped_column(ForeignKey("days.id"), index=True, nullable=False)
    habit_id: Mapped[int] = mapped_column(ForeignKey("habits.id"), index=True, nullable=False)

    completed: Mapped[bool] = mapped_column(Boolean, default=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), onupdate=lambda: datetime.now(UTC))

    day: Mapped[Day] = relationship(back_populates="entries")
    habit: Mapped[Habit] = relationship(back_populates="entries")

