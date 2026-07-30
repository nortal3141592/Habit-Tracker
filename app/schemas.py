from datetime import date, datetime
from pydantic import BaseModel, model_validator, ConfigDict, Field

from models import PeriodMode


class TrackerCreate(BaseModel):
    name: str = Field(min_length=1)

    start_date: date
    num_days: int | None = None
    end_date: date | None = None
    initial_habit_names: list[str]

    @model_validator(mode="after")
    def check_period_xor(self):
        if (self.num_days is None) == (self.end_date is None):
            raise ValueError("Provide exactly one of num_days or end_date.")
        if not self.initial_habit_names:
            raise ValueError("At least one initial habit is required.")
        return self

class TrackerResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str

    period_mode: PeriodMode | None

    start_date: date | None
    created_at: datetime

class HabitCreate(BaseModel):
    name: str = Field(min_length=1)


class HabitResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    tracker_id: int
    name: str
    created_at: datetime
    archived_at: datetime | None

class MatrixHabitOut(BaseModel):
    id: int
    name: str


class MatrixEntryOut(BaseModel):
    entry_id: int
    habit_id: int
    completed: bool


class MatrixDayOut(BaseModel):
    id: int
    day_index: int
    date: date
    entries: list[MatrixEntryOut]


class MatrixResponse(BaseModel):
    tracker_id: int
    habits: list[MatrixHabitOut]
    days: list[MatrixDayOut]


class EntryUpdate(BaseModel):
    entry_id: int
    completed: bool


class MatrixUpdateRequest(BaseModel):
    updates: list[EntryUpdate]


class DayAppendRequest(BaseModel):
    num_days: int = Field(gt=0)


class DayResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    day_index: int
    date: date
