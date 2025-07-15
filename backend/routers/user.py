from fastapi import APIRouter
from fastapi.params import Depends
from sqlalchemy.orm import Session

from backend.database.db import get_db
from backend.schemas import user

router = APIRouter()

@router.post("/signup")
def create_user(request: user, db: Session = Depends(get_db())):




