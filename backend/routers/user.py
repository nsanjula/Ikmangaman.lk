from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from starlette import status

from backend.database.db import get_db
from backend.models import users
from backend.schemas import user
from backend.utils.hashing import hash_password
from backend.utils.token import get_current_user

router = APIRouter(
    tags= ["user"]
)

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

@router.get("/my-profile")
def get_user(db: Session = Depends(get_db), current_user: user.User = Depends(get_current_user)):
    accessed_user = db.query(users.User).filter(users.User.username == current_user.username).first()
    return accessed_user

@router.put("/update-profile")
def update_user_profile(request: user.UserUpdate, db: Session = Depends(get_db), current_user: user.User = Depends(get_current_user)):
    db_user = db.query(users.User).filter(users.User.username == current_user.username).first()

    if not db_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # Update fields only if provided
    if request.firstname:
        db_user.firstname = request.firstname
    if request.lastname:
        db_user.lastname = request.lastname
    if request.date_of_birth:
        db_user.date_0f_birth = request.date_of_birth
    if request.password:
        db_user.password = hash_password(request.password)

    db.commit()
    db.refresh(db_user)

    return {"message": "Profile updated successfully"}




