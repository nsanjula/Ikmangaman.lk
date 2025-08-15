from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.models.saved_places import SavedPlace
from backend.models.users import User

from backend.database.db import get_db
from backend.schemas import saved_place
from backend.utils.auth_token import get_current_user

router = APIRouter(
    prefix="/saved_places",
    tags=["saved_places"]
)

@router.post('/saved_places')
def savePlace(name : str, db : Session = Depends(get_db), token_user : User = Depends(get_current_user)):
    current_user = db.query(User).filter(User.username == token_user.username).first()
    if not current_user:
        raise HTTPException(status_code=404, detail="User not found")

    # Check if place is already saved
    existing_saved_place = db.query(SavedPlace).filter(
        SavedPlace.user_id == current_user.user_id,
        SavedPlace.name == name
    ).first()

    if existing_saved_place:
        return {"message": "Place already saved", "place": existing_saved_place}

    saved_places = db.query(SavedPlace).filter(SavedPlace.user_id == current_user.user_id).order_by(SavedPlace.created_at).all()

    if len(saved_places) >= 6:
        db.delete(saved_places[0])
        db.commit()

    # save new place
    saved_place = SavedPlace(
        user_id = current_user.user_id,
        name=name
    )

    db.add(saved_place)
    db.commit()
    db.refresh(saved_place)

    return {"message": "Place saved successfully", "place": saved_place}

@router.get('/saved_places', response_model=list[saved_place.SavedPlace])
def get_saved_places(db : Session = Depends(get_db), token_user : User = Depends(get_current_user)):
    current_user = db.query(User).filter(User.username == token_user.username).first()
    if not current_user:
        raise HTTPException(status_code=404, detail="User not found")

    saved_places = db.query(SavedPlace).filter(SavedPlace.user_id == current_user.user_id).order_by(SavedPlace.created_at.desc()).all()

    return saved_places

@router.delete('/saved_places')
def unsavePlace(name: str, db: Session = Depends(get_db), token_user: User = Depends(get_current_user)):
    current_user = db.query(User).filter(User.username == token_user.username).first()
    if not current_user:
        raise HTTPException(status_code=404, detail="User not found")

    # Find the saved place to delete
    saved_place = db.query(SavedPlace).filter(
        SavedPlace.user_id == current_user.user_id,
        SavedPlace.name == name
    ).first()

    if not saved_place:
        raise HTTPException(status_code=404, detail="Saved place not found")

    db.delete(saved_place)
    db.commit()

    return {"message": "Place removed successfully"}
