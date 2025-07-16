from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database.db import get_db
from backend.models import latest_questionnaire, location_coordinates, users
from backend.schemas import questionnaire, user
from backend.utils import month_mapper
from backend.utils.token import get_current_user

router = APIRouter()

@router.post("/questionnaire")
def submit_questionnaire(request: questionnaire.Questionnaire, db: Session = Depends(get_db), current_user: user.User = Depends(get_current_user) ):
    month_int = month_mapper.get_month_int(request.travel_month)

    start_location_obj = db.query(location_coordinates.LocationCoordinates).filter(location_coordinates.LocationCoordinates.location_name == request.start_location).first()
    if not start_location_obj:
        raise HTTPException(status_code=404, detail="Start location not found")

    accessed_user = db.query(users.User).filter(users.User.username == current_user.username).first()

    existing = db.query(latest_questionnaire.LatestQuestionnaire).filter(latest_questionnaire.LatestQuestionnaire.user_id == accessed_user.user_id).first()

    if existing:
        existing.nature = request.nature
        existing.adventure = request.adventure
        existing.luxury = request.luxury
        existing.culture = request.culture
        existing.relaxation = request.relaxation
        existing.wellness = request.wellness
        existing.local_life = request.local_life
        existing.wildlife = request.wild_life
        existing.food = request.food
        existing.spirituality = request.spirituality
        existing.eco_tourism = request.eco_tourism
        existing.month = month_int
        existing.no_of_people = request.no_of_people
        existing.starting_location_latitudes = start_location_obj.latitudes
        existing.starting_location_longitudes = start_location_obj.longitudes
    else:
        new_questionnaire = latest_questionnaire.LatestQuestionnaire(
            user_id=accessed_user.user_id,
            nature=request.nature,
            adventure=request.adventure,
            luxury=request.luxury,
            culture=request.culture,
            relaxation=request.relaxation,
            wellness=request.wellness,
            local_life=request.local_life,
            wildlife=request.wild_life,
            food=request.food,
            spirituality=request.spirituality,
            eco_tourism=request.eco_tourism,
            month=month_int,
            no_of_people=request.no_of_people,
            starting_location_latitudes=start_location_obj.latitudes,
            starting_location_longitudes=start_location_obj.longitudes
        )
        db.add(new_questionnaire)

    db.commit()
    return {"status": "success"}

@router.get("/questionnaire")
def get_latest_questionnaire(db: Session = Depends(get_db), current_user: user.User = Depends(get_current_user)):

    accessed_user = db.query(users.User).filter(users.User.username == current_user.username).first()
    latest_questionnaire_of_acc_user = db.query(latest_questionnaire.LatestQuestionnaire).filter(latest_questionnaire.LatestQuestionnaire.user_id == accessed_user.user_id).first()
    return latest_questionnaire_of_acc_user

