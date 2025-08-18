from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from io import BytesIO

from backend.database.db import get_db
from backend.models import Destination, users, latest_questionnaire, Guide, location_coordinates
from backend.models.destination_imgs import DestinationImages
from backend.routers.hotels import get_hotel
from backend.routers.weather import get_forecast
from backend.schemas import user, questionnaire
from backend.services.budget import cost_for_bicycle, cost_for_car, cost_for_p_bus, cost_for_transit, get_transit_fare
from backend.services.distance import get_distance_and_duration_for_one_location
from backend.utils.auth_token import get_current_user

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

        # Try to get weather data, fallback to empty array if it fails
    try:
        weather_data = await get_forecast(destination_obj.name)
        if weather_data is None:
            weather_data = []
    except Exception as e:
        print(f"Weather API failed for {destination_obj.name}: {e}")
        weather_data = []

    # Try to get hotel data, fallback to empty array if it fails
    try:
        hotel_data = await get_hotel(destination_obj.name)
        if hotel_data is None:
            hotel_data = []
    except Exception as e:
        print(f"Hotel API failed for {destination_obj.name}: {e}")
        hotel_data = []

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
        "destination image" : f"/destination-image/{destination_obj.destination_id}"
    }

    return response

@router.post("/temp-questionnaire/{destination_id}")
async def get_destination_from_temp_questionnaire(
        request: questionnaire.TempQuestionnaire,
        db: Session = Depends(get_db),
        current_user: user.User = Depends(get_current_user)
):
    print(f"Temp questionnaire request: {request}")
    print(f"Looking for start location: '{request.start_location}'")

    start_location_obj = db.query(location_coordinates.LocationCoordinates).filter(location_coordinates.LocationCoordinates.location_name == request.start_location).first()

    if not start_location_obj:
        print(f"Start location '{request.start_location}' not found in database")
        # List available locations for debugging
        available_locations = db.query(location_coordinates.LocationCoordinates).all()
        available_names = [loc.location_name for loc in available_locations]
        print(f"Available locations: {available_names}")

        # Fallback coordinates for common Sri Lankan cities
        fallback_coordinates = {
            "Colombo": {"lat": 6.9271, "lng": 79.8612},
            "Kandy": {"lat": 7.2906, "lng": 80.6337},
            "Galle": {"lat": 6.0535, "lng": 80.2210},
            "Jaffna": {"lat": 9.6615, "lng": 80.0255},
            "Trincomalee": {"lat": 8.5874, "lng": 81.2152},
            "Anuradhapura": {"lat": 8.3114, "lng": 80.4037},
            "Pollonaruwa": {"lat": 7.9403, "lng": 81.0188},
            "Nuwara Eliya": {"lat": 6.9497, "lng": 80.7891},
            "Ella": {"lat": 6.8667, "lng": 81.0667},
            "Matara": {"lat": 5.9485, "lng": 80.5353},
            "Negombo": {"lat": 7.2084, "lng": 79.8380},
            "Batticaloa": {"lat": 7.7102, "lng": 81.6924},
            "Badulla": {"lat": 6.9934, "lng": 81.0550},
            "Kurunegala": {"lat": 7.4818, "lng": 80.3609},
            "Ratnapura": {"lat": 6.6828, "lng": 80.4037},
            "Hambantota": {"lat": 6.1241, "lng": 81.1185},
            "Puttalam": {"lat": 8.0362, "lng": 79.8283},
            "Vavniya": {"lat": 8.7514, "lng": 80.4971},
            "Kalutara": {"lat": 6.5854, "lng": 79.9607},
            "Ampara": {"lat": 7.2981, "lng": 81.6821},
        }

        if request.start_location in fallback_coordinates:
            coords = fallback_coordinates[request.start_location]
            print(f"Using fallback coordinates for {request.start_location}: {coords}")
            start_lat = coords["lat"]
            start_lng = coords["lng"]
        else:
            raise HTTPException(status_code=404, detail=f"Start location '{request.start_location}' not found. Available locations: {available_names}")
    else:
        print(f"Found start location: {start_location_obj.location_name} at ({start_location_obj.latitudes}, {start_location_obj.longitudes})")
        start_lat = start_location_obj.latitudes
        start_lng = start_location_obj.longitudes

    destination_obj = db.query(Destination).filter(Destination.destination_id == request.destination_id).first()
    if not destination_obj:
        raise HTTPException(status_code=404, detail=f"Destination with ID {request.destination_id} not found")

    trip_distance_and_duration = get_distance_and_duration_for_one_location(
        start_lat,
        start_lng,
        destination_obj.latitude,
        destination_obj.longitude
    )

    distance = trip_distance_and_duration["distance_text"].split()[0]
    distance_f = float(distance)
    duration = trip_distance_and_duration["duration_text"]

    # Try to get weather data, fallback to empty array if it fails
    try:
        weather_data = await get_forecast(destination_obj.name)
        if weather_data is None:
            weather_data = []
    except Exception as e:
        print(f"Weather API failed for {destination_obj.name}: {e}")
        weather_data = []

    # Try to get hotel data, fallback to empty array if it fails
    try:
        hotel_data = await get_hotel(destination_obj.name)
        if hotel_data is None:
            hotel_data = []
    except Exception as e:
        print(f"Hotel API failed for {destination_obj.name}: {e}")
        hotel_data = []

    response = {
        "destination_name": destination_obj.name,
        "destination_id": destination_obj.destination_id,
        "latitude": destination_obj.latitude,
        "longitude": destination_obj.longitude,
        "description": destination_obj.description,
        "things to do": destination_obj.things_to_do.split("/"),
        "distance": distance,
        "duration": duration,
        "weather data": weather_data,
        "hotel data": hotel_data,
        "cost for bicycle": round(cost_for_bicycle(distance_f, request.no_of_people)),
        "cost for car": round(cost_for_car(distance_f, request.no_of_people)),
        "cost for private bus": round(cost_for_p_bus(distance_f, request.no_of_people)),
        "cost for transit": round(cost_for_transit(distance_f, request.no_of_people, db)),
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
        "destination image": f"/destination-image/{destination_obj.destination_id}"
    }

    return response
