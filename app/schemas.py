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
