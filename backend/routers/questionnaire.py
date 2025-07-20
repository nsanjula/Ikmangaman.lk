from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from starlette import status

from backend.database.db import get_db
from backend.models import latest_questionnaire, location_coordinates, users
from backend.schemas import questionnaire, user
from backend.utils import month_mapper
from backend.utils.token import get_current_user

router = APIRouter(
    tags=["questionnaire"]
)

@router.post("/questionnaire", status_code=status.HTTP_201_CREATED)
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

@router.get("/questionnaire", status_code=status.HTTP_200_OK)
def get_latest_questionnaire(db: Session = Depends(get_db), current_user: user.User = Depends(get_current_user)):

    accessed_user = db.query(users.User).filter(users.User.username == current_user.username).first()
    latest_questionnaire_of_accessed_user = db.query(latest_questionnaire.LatestQuestionnaire).filter(latest_questionnaire.LatestQuestionnaire.user_id == accessed_user.user_id).first()

    if not latest_questionnaire_of_accessed_user:
        raise HTTPException(status_code=404, detail="No questionnaire found")

    # Convert month integer back to month string
    travel_month = month_mapper.get_month_str(latest_questionnaire_of_accessed_user.month)

    # Return properly formatted response matching frontend expectations
    return {
        "nature": latest_questionnaire_of_accessed_user.nature,
        "adventure": latest_questionnaire_of_accessed_user.adventure,
        "luxury": latest_questionnaire_of_accessed_user.luxury,
        "culture": latest_questionnaire_of_accessed_user.culture,
        "relaxation": latest_questionnaire_of_accessed_user.relaxation,
        "wellness": latest_questionnaire_of_accessed_user.wellness,
        "local_life": latest_questionnaire_of_accessed_user.local_life,
        "wild_life": latest_questionnaire_of_accessed_user.wildlife,
        "food": latest_questionnaire_of_accessed_user.food,
        "spirituality": latest_questionnaire_of_accessed_user.spirituality,
        "eco_tourism": latest_questionnaire_of_accessed_user.eco_tourism,
        "travel_month": travel_month,
        "no_of_people": latest_questionnaire_of_accessed_user.no_of_people,
        "start_location": latest_questionnaire_of_accessed_user.start_location if hasattr(latest_questionnaire_of_accessed_user, 'start_location') else "",
        "starting_location_latitudes": latest_questionnaire_of_accessed_user.starting_location_latitudes,
        "starting_location_longitudes": latest_questionnaire_of_accessed_user.starting_location_longitudes
    }
