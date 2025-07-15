from datetime import date
from typing import Optional

from pydantic import BaseModel

class User(BaseModel):
    firstname: str
    lastname : Optional[str]
    date_of_birth: date
    username: str
    password: str
