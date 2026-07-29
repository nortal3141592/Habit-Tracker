from typing import Annotated

from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from core.database import get_db
from sqlalchemy import select, func

import models as models

from schemas import TrackerCreate, TrackerResponse

from utils.tracker_utils import build_tracker_with_config, list_trackers, get_tracker_or_404, delete_tracker

router = APIRouter()

DBSession = Annotated[AsyncSession, Depends(get_db)]

@router.post("", response_model=TrackerResponse, status_code=status.HTTP_201_CREATED)
async def create_tracker(payload: TrackerCreate, db: AsyncSession = Depends(get_db)):
    tracker = await build_tracker_with_config(db, payload)

    await db.commit()
    await db.refresh(tracker)

    return tracker

@router.get("", response_model=list[TrackerResponse])
async def get_trackers(db: DBSession):
    return await list_trackers(db)


@router.get("/{tracker_id}", response_model=TrackerResponse)
async def get_tracker(tracker_id: int, db: AsyncSession = Depends(get_db)):
    return await get_tracker_or_404(db, tracker_id)

@router.delete("/{tracker_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_tracker(tracker_id: int, db: AsyncSession = Depends(get_db)):
    tracker = await get_tracker_or_404(db, tracker_id)
    await delete_tracker(db, tracker)
    await db.commit()