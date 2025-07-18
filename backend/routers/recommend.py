from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.database.db import get_db
from backend.models import users, latest_questionnaire
from backend.schemas import user
from backend.services.aimodel1 import predict_traveler_type
from backend.services.budget import calculate_the_budget
from backend.services.distance import get_distance_and_duration_for_recommendations
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
    top_destinations_with_scores = get_top_destinations(traveler_type_results, travel_season, db)

    # return matching_destinations

    # Example: assume user_start_location is stored in the questionnaire
    user_location = {
        "lat": latest_questionnaire_of_accessed_user.starting_location_latitudes,
        "lng": latest_questionnaire_of_accessed_user.starting_location_longitudes
    }

    destinations_for_matrix = [{
        "latitude": d[0].latitude,
        "longitude": d[0].longitude
    } for d in top_destinations_with_scores]

    distance_results = get_distance_and_duration_for_recommendations(user_location, destinations_for_matrix)

    # Final response formatting
    response = []
    for i, (destination, score) in enumerate(top_destinations_with_scores):
        rating_label = "Very Good" if score >= 0.8 else "Good" if score >= 0.6 else "Average"
        response.append({
            "destination_id": destination.destination_id,
            "name": destination.name,
            "match_score": round(score, 2),
            "rating_label": rating_label,
            "estimated_budget": calculate_the_budget(destination.avg_cost, distance_results[i]["distance"], latest_questionnaire_of_accessed_user.no_of_people),
            "distance": distance_results[i]["distance"],
            "travel_time": distance_results[i]["travel_time"],
            "thumbnail_img": f"/destination-image/{destination.destination_id}"
        })

    return response


