from datetime import date
from typing import Optional

from pydantic import BaseModel

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel): # to get user details after he authenticated
    username: str
