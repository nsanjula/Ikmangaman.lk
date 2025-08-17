from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class SavedPlace(BaseModel):
    id: int
    user_id: int
    name : str
    created_at: datetime

    class Config:
        orm_mode = True