from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from io import BytesIO

from backend.database.db import get_db
from backend.models import Destination, users, latest_questionnaire, Guide
from backend.models.destination_imgs import DestinationImages
from backend.routers.hotels import get_hotel
from backend.routers.weather import get_forecast
from backend.schemas import user
from backend.services.budget import cost_for_bicycle, cost_for_car, cost_for_p_bus, cost_for_transit, get_transit_fare
from backend.services.distance import get_distance_and_duration_for_one_location
from backend.utils.token import get_current_user

router = APIRouter(
    tags=["destination"]
)

@router.get("/destination-image/{destination_id}")
def get_destination_image(destination_id: int, db: Session = Depends(get_db)):
    image_obj = db.query(DestinationImages).filter(DestinationImages.destination_id == destination_id).first()

    if not image_obj or not image_obj.image:
        raise HTTPException(status_code=404, detail="Image not found")

    return StreamingResponse(BytesIO(image_obj.image), media_type="image/jpeg")

@router.get("/guides/photo/{guide_id}")
def get_guide_photo(guide_id: int, db: Session = Depends(get_db)):
    guide = db.query(Guide).filter(Guide.guide_id == guide_id).first()
    if not guide or not guide.photo:
        raise HTTPException(status_code=404, detail="Photo not found")
    return StreamingResponse(BytesIO(guide.photo), media_type="image/jpeg")

@router.get("/{destination_id}")
async def get_destination(destination_id: int, db: Session = Depends(get_db), current_user: user.User = Depends(get_current_user)):
    accessed_user = db.query(users.User).filter(users.User.username == current_user.username).first()
    if not accessed_user:
        raise HTTPException(status_code=404, detail="User not found")

    latest_questionnaire_of_accessed_user = db.query(latest_questionnaire.LatestQuestionnaire).filter(latest_questionnaire.LatestQuestionnaire.user_id == accessed_user.user_id).first()
    if not latest_questionnaire_of_accessed_user:
        raise HTTPException(status_code=400, detail="Please complete the travel questionnaire first to access destination details")

    destination_obj = db.query(Destination).filter(Destination.destination_id == destination_id).first()
    if not destination_obj:
        raise HTTPException(status_code=404, detail=f"Destination with ID {destination_id} not found")

    trip_distance_and_duration = get_distance_and_duration_for_one_location(
        latest_questionnaire_of_accessed_user.starting_location_latitudes,
        latest_questionnaire_of_accessed_user.starting_location_longitudes,
        destination_obj.latitude,
        destination_obj.longitude
    )

    distance = trip_distance_and_duration["distance_text"].split()[0]
    distance_f = float(distance)
    duration = trip_distance_and_duration["duration_text"]

        # Try to get weather data, fallback to None if it fails
    try:
        weather_data = await get_forecast(destination_obj.name)
    except Exception as e:
        print(f"Weather API failed for {destination_obj.name}: {e}")
        weather_data = None

    # Try to get hotel data, fallback to None if it fails
    try:
        hotel_data = await get_hotel(destination_obj.name)
    except Exception as e:
        print(f"Hotel API failed for {destination_obj.name}: {e}")
        hotel_data = None

    # try:
    #     transit_cost_per_person = get_transit_fare(
    #         latest_questionnaire_of_accessed_user.starting_location_latitudes,
    #         latest_questionnaire_of_accessed_user.starting_location_longitudes,
    #         destination_obj.latitude,
    #         destination_obj.longitude
    #     )
    #     if transit_cost_per_person is not None:
    #         total_transit_cost = transit_cost_per_person * latest_questionnaire_of_accessed_user.no_of_people
    #         print("Transit data from API")
    #     else:
    #         # fallback to your logic
    #         total_transit_cost = cost_for_transit(distance_f, latest_questionnaire_of_accessed_user.no_of_people)
    #         print("Transit data from hard coded values")
    # except Exception as e:
    #     print(f"Transit fare fetch failed: {e}")
    #     total_transit_cost = cost_for_transit(distance_f, latest_questionnaire_of_accessed_user.no_of_people)


    response = {
        "destination_name" : destination_obj.name,
        "destination_id" : destination_obj.destination_id,
        "latitude" : destination_obj.latitude,
        "longitude" : destination_obj.longitude,
        "description" : destination_obj.description,
        "things to do" : destination_obj.things_to_do.split("/"),
        "distance" : distance,
        "duration" : duration,
        "weather data" : weather_data,
        "hotel data" : hotel_data,
        "cost for bicycle" : round(cost_for_bicycle(distance_f, latest_questionnaire_of_accessed_user.no_of_people)),
        "cost for car" : round(cost_for_car(distance_f, latest_questionnaire_of_accessed_user.no_of_people)),
        "cost for private bus" : round(cost_for_p_bus(distance_f, latest_questionnaire_of_accessed_user.no_of_people)),
        "cost for transit" : round(cost_for_transit(distance_f, latest_questionnaire_of_accessed_user.no_of_people, db)),
        "guide details": [
            {
                "guide_id": guide.guide_id,
                "name": guide.name,
                "gender": guide.gender,
                "contact_no": guide.contact_no,
                "photo_url": f"/guides/photo/{guide.guide_id}"
            }
            for guide in destination_obj.guides
        ],
        "destiantion image" : f"/destination-image/{destination_obj.destination_id}"
    }

    return response
