from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.database.db import get_db
from backend.models import users, latest_questionnaire
from backend.schemas import user
from backend.services.aimodel1 import predict_traveler_type
from backend.services.scoring import get_top_destinations
from backend.utils import month_mapper
from backend.utils.age_calc import calculate_age
from backend.utils.token import get_current_user

router = APIRouter(
    tags=["recommend"]
)

@router.get("/recommendations")
def get_recommendations(db: Session = Depends(get_db), current_user: user.User = Depends(get_current_user)):
    accessed_user = db.query(users.User).filter(users.User.username == current_user.username).first()
    latest_questionnaire_of_accessed_user = db.query(latest_questionnaire.LatestQuestionnaire).filter(latest_questionnaire.LatestQuestionnaire.user_id == accessed_user.user_id).first()

    if not latest_questionnaire_of_accessed_user:
        return {"error": "No questionnaire found for the current user"}

    user_age = calculate_age(accessed_user.date_0f_birth)
    travel_season = month_mapper.get_month_season(latest_questionnaire_of_accessed_user.month)

    interests_dict = {
        "nature" : latest_questionnaire_of_accessed_user.nature,
        "adventure": latest_questionnaire_of_accessed_user.adventure,
        "luxury": latest_questionnaire_of_accessed_user.luxury,
        "culture": latest_questionnaire_of_accessed_user.culture,
        "relaxation": latest_questionnaire_of_accessed_user.relaxation,
        "wellness": latest_questionnaire_of_accessed_user.wellness,
        "local_life": latest_questionnaire_of_accessed_user.local_life,
        "wildlife": latest_questionnaire_of_accessed_user.wildlife,
        "food": latest_questionnaire_of_accessed_user.food,
        "spirituality": latest_questionnaire_of_accessed_user.spirituality,
        "eco_tourism": latest_questionnaire_of_accessed_user.eco_tourism
    }

    traveler_type_results = predict_traveler_type(user_age, travel_season, interests_dict)
    matching_destinations = get_top_destinations(traveler_type_results, travel_season, db)

    return matching_destinations



