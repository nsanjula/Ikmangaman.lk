from datetime import date
from typing import Optional

from pydantic import BaseModel

class User(BaseModel):
    firstname: str
    lastname : Optional[str] = None
    date_of_birth: date
    username: str
    password: str

class UserUpdate(BaseModel):
    firstname: Optional[str] = None
    lastname: Optional[str] = None
    date_of_birth: Optional[date] = None
    password: Optional[str] = None