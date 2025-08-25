# backend/routers/itinerary.py
import os
from fastapi import APIRouter, HTTPException, Request, Response, Depends
from sqlalchemy.orm import Session

from backend.services.pdf_via_api2pdf import html_to_pdf_via_api2pdf, PDFExportError

from backend.database.db import get_db
from backend.models import Itinerary, LocationCoordinates, Destination, User
from backend.routers.hotels import get_hotel
from backend.routers.weather import get_forecast
from backend.schemas import user
from backend.schemas.questionnaire import TripPlanQuestionnaire, TripPlanDayInterests, DayAssignment
from backend.services.aimodel1 import predict_traveler_type
from backend.services.budget import calculate_the_budget, cost_for_bicycle, cost_for_car, cost_for_p_bus, cost_for_transit
from backend.services.distance import get_distance_and_duration_for_recommendations, get_distance_and_duration_for_one_location
from backend.services.itinerary_path import generate_route_map_url
from backend.services.pdf_generator import render_itinerary_html
from backend.services.scoring import get_top_destinations
from backend.utils import month_mapper
from backend.utils.age_calc import calculate_age
from backend.utils.auth_token import get_current_user
from backend.utils.month_mapper import get_month_int

router = APIRouter(
    tags=["itinerary"],
    prefix="/itinerary"
)

@router.post("/")
def create_itinerary(
    questionnaire: TripPlanQuestionnaire,
    db: Session = Depends(get_db),
    current_user: user.User = Depends(get_current_user)
):
    new_itinerary = Itinerary(
        username=current_user.username,
        travel_month=questionnaire.travel_month,
        no_of_people=questionnaire.no_of_people,
        start_location=questionnaire.start_location
    )
    db.add(new_itinerary)
    db.commit()
    db.refresh(new_itinerary)
    return {"itinerary_id": new_itinerary.id}

@router.post("/{itinerary_id}/day/{day_number}/recommendations")
def get_day_recommendations(
    itinerary_id: int,
    day_number: int,
    payload: TripPlanDayInterests,
    db: Session = Depends(get_db),
    current_user: user.User = Depends(get_current_user)
):
    # Fetch itinerary
    itinerary = db.query(Itinerary).filter(Itinerary.id == itinerary_id).first()
    if not itinerary:
        raise HTTPException(status_code=404, detail="Itinerary not found")

    # Determine origin
    if day_number == 1:
        start_location_obj = db.query(LocationCoordinates).filter(
            LocationCoordinates.location_name == itinerary.start_location
        ).first()
        if not start_location_obj:
            raise HTTPException(status_code=400, detail="Invalid start location")
        origin_lat = start_location_obj.latitudes
        origin_lng = start_location_obj.longitudes
    else:
        prev_dest_id = getattr(itinerary, f"day{day_number - 1}_dest_id")
        if not prev_dest_id:
            raise HTTPException(status_code=400, detail="Previous day has no destination")
        prev_dest = db.query(Destination).filter(Destination.destination_id == prev_dest_id).first()
        origin_lat = prev_dest.latitude
        origin_lng = prev_dest.longitude

    # Prepare exclude list
    exclude_ids = [
        d for d in [
            itinerary.day1_dest_id,
            itinerary.day2_dest_id,
            itinerary.day3_dest_id,
            itinerary.day4_dest_id
        ] if d is not None
    ]

    # Exclude start location if it exists as a destination
    start_dest = db.query(Destination).filter(Destination.name == itinerary.start_location).first()
    if start_dest:
        exclude_ids.append(start_dest.destination_id)

    month_int = get_month_int(itinerary.travel_month)
    travel_season = month_mapper.get_month_season(month_int)

    user_obj = db.query(User).filter(User.username == current_user.username).first()
    age = calculate_age(user_obj.date_0f_birth)
    interests_dict = payload.dict()

    traveler_type_results = predict_traveler_type(age, travel_season, interests_dict)

    top_destinations_with_scores = get_top_destinations(
        traveler_type_results,
        travel_season,
        db,
        exclude_ids=exclude_ids
    )[:6]

    # Distances
    user_location = {"lat": origin_lat, "lng": origin_lng}
    destinations_for_matrix = [
        {"latitude": d[0].latitude, "longitude": d[0].longitude}
        for d in top_destinations_with_scores
    ]
    distance_results = get_distance_and_duration_for_recommendations(user_location, destinations_for_matrix)

    # Build response
    response = []
    for i, (destination, score) in enumerate(top_destinations_with_scores):
        rating_label = "Very Good" if score >= 0.8 else "Good" if score >= 0.6 else "Average"

        filters = []
        if destination.hill_country == 1:
            filters.append("hill_country")
        if destination.coastal == 1:
            filters.append("coastal")
        if destination.dry_zone == 1:
            filters.append("dry_zone")
        if destination.urban == 1:
            filters.append("urban")

        response.append({
            "destination_id": destination.destination_id,
            "name": destination.name,
            "match_score": round(score, 2),
            "rating_label": rating_label,
            "estimated_budget": calculate_the_budget(
                destination.avg_cost,
                distance_results[i]["distance"],
                itinerary.no_of_people
            ),
            "filters": filters,
            "distance": distance_results[i]["distance"],
            "travel_time": distance_results[i]["travel_time"],
            "thumbnail_img": f"/destination-image/{destination.destination_id}"
        })

    return response

@router.put("/{itinerary_id}/day/{day_number}")
def assign_destination_to_a_day(
    itinerary_id: int,
    day_number: int,
    payload: DayAssignment,
    db: Session = Depends(get_db),
    current_user: user.User = Depends(get_current_user)
):
    itinerary = db.query(Itinerary).filter(Itinerary.id == itinerary_id).first()
    if not itinerary:
        raise HTTPException(status_code=404, detail="Itinerary not found")

    day_column = f"day{day_number}_dest_id"
    budget_column = f"day{day_number}_budget"
    if not hasattr(Itinerary, day_column):
        raise HTTPException(status_code=400, detail="Invalid day number")

    setattr(itinerary, day_column, payload.destination_id)
    setattr(itinerary, budget_column, payload.estimated_budget)
    db.commit()

    return {
        "message": f"Destination {payload.destination_id} added to Day {day_number}",
        "estimated_budget": payload.estimated_budget
    }

@router.post("/{itinerary_id}/export")
async def export_itinerary(
    itinerary_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: user.User = Depends(get_current_user)
):
    # Fetch itinerary
    itinerary = db.query(Itinerary).filter(Itinerary.id == itinerary_id).first()
    if not itinerary:
        raise HTTPException(status_code=404, detail="Itinerary not found")

    # Start location coords
    start_location_obj = db.query(LocationCoordinates).filter(
        LocationCoordinates.location_name == itinerary.start_location
    ).first()
    if not start_location_obj:
        raise HTTPException(status_code=400, detail="Invalid start location")

    # Use a public base for assets if provided (so pdflayer can fetch images), else fall back to the request base URL.
    asset_base = os.getenv("PDF_ASSET_BASE_URL", str(request.base_url).rstrip("/"))

    # Build days data
    days_data = []
    for day_num in range(1, 5):
        dest_id = getattr(itinerary, f"day{day_num}_dest_id")
        budget = getattr(itinerary, f"day{day_num}_budget")
        if dest_id:
            dest = db.query(Destination).filter(Destination.destination_id == dest_id).first()
            days_data.append({
                "day": day_num,
                "name": dest.name,
                "latitude": dest.latitude,
                "longitude": dest.longitude,
                "description": dest.description,
                "things_to_do": dest.things_to_do,
                "thumbnail": f"{asset_base}/destination-image/{dest.destination_id}",
                "budget": budget or 0
            })

    accessed_user = db.query(User).filter(User.username == current_user.username).first()

    # Route map
    route_map_url = generate_route_map_url(
        start_location_obj.latitudes,
        start_location_obj.longitudes,
        days_data
    )

    # Render HTML (template must include <base href="{{ base_url }}/">)
    html_content = render_itinerary_html(
        travel_month=itinerary.travel_month,
        no_of_people=itinerary.no_of_people,
        start_location=itinerary.start_location,
        accessed_user=accessed_user.firstname,
        route_map_url=route_map_url,
        total_budget=sum(d["budget"] for d in days_data if d.get("budget") is not None),
        days=days_data,
        base_url=asset_base,
    )

    try:
        pdf_bytes = await html_to_pdf_via_api2pdf(html_content)
    except PDFExportError as e:
        raise HTTPException(status_code=502, detail=f"PDF export failed: {e}")

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=itinerary_{itinerary_id}.pdf"}
    )

@router.get("/{itinerary_id}/day/{day_number}/destination/{destination_id}")
async def get_destination(
    itinerary_id: int,
    day_number: int,
    destination_id: int,
    db: Session = Depends(get_db),
    current_user: user.User = Depends(get_current_user)
):
    itinerary_obj = db.query(Itinerary).filter(Itinerary.id == itinerary_id).first()
    if not itinerary_obj:
        raise HTTPException(status_code=404, detail="Itinerary not found")

    destination_obj = db.query(Destination).filter(Destination.destination_id == destination_id).first()
    if not destination_obj:
        raise HTTPException(status_code=404, detail="Destination not found")

    # Determine origin
    if day_number == 1:
        start_location_obj = db.query(LocationCoordinates).filter(
            LocationCoordinates.location_name == itinerary_obj.start_location
        ).first()
        if not start_location_obj:
            raise HTTPException(status_code=400, detail="Invalid start location")
        origin_lat = start_location_obj.latitudes
        origin_lng = start_location_obj.longitudes
    else:
        prev_dest_id = getattr(itinerary_obj, f"day{day_number - 1}_dest_id")
        if not prev_dest_id:
            raise HTTPException(status_code=400, detail="Previous day has no destination")
        prev_dest = db.query(Destination).filter(Destination.destination_id == prev_dest_id).first()
        origin_lat = prev_dest.latitude
        origin_lng = prev_dest.longitude

    trip_distance_and_duration = get_distance_and_duration_for_one_location(
        origin_lat,
        origin_lng,
        destination_obj.latitude,
        destination_obj.longitude
    )

    distance = trip_distance_and_duration["distance_text"].split()[0]
    distance_f = float(distance)
    duration = trip_distance_and_duration["duration_text"]

    # Weather (best-effort)
    try:
        weather_data = await get_forecast(destination_obj.name)
        if weather_data is None:
            weather_data = []
    except Exception as e:
        print(f"Weather API failed for {destination_obj.name}: {e}")
        weather_data = []

    # Hotels (best-effort)
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
        "cost for bicycle": round(cost_for_bicycle(distance_f, itinerary_obj.no_of_people)),
        "cost for car": round(cost_for_car(distance_f, itinerary_obj.no_of_people)),
        "cost for private bus": round(cost_for_p_bus(distance_f, itinerary_obj.no_of_people)),
        "cost for transit": round(cost_for_transit(distance_f, itinerary_obj.no_of_people, db)),
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
