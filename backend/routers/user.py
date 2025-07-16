from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from starlette import status

from backend.database.db import get_db
from backend.models import users
from backend.schemas import user
from backend.utils.hashing import hash_password

router = APIRouter()

@router.post("/signup", status_code=status.HTTP_201_CREATED)
def create_user(request: user.User, db: Session = Depends(get_db)):

    existing_user = db.query(users.User).filter(users.User.username == request.username).first()
    if existing_user:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username already taken")

    hashed_password = hash_password(request.password)
    new_user = users.User(
        firstname= request.firstname,
        lastname= request.lastname,
        date_0f_birth= request.date_of_birth,
        username= request.username,
        password= hashed_password
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return "User created"





