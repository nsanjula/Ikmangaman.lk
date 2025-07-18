import os
import requests
from dotenv import load_dotenv

load_dotenv()

GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")

def get_distance_and_duration_for_recommendations(user_location, destinations):
    origins = f"{user_location['lat']},{user_location['lng']}"
    destination_str = "|".join([f"{d['latitude']},{d['longitude']}" for d in destinations])

    url = "https://maps.googleapis.com/maps/api/distancematrix/json"
    params = {
        "origins": origins,
        "destinations": destination_str,
        "mode": "driving",
        "key": GOOGLE_MAPS_API_KEY
    }

    response = requests.get(url, params=params)
    data = response.json()

    elements = data['rows'][0]['elements']
    result = []
    for i, element in enumerate(elements):
        result.append({
            "distance": element['distance']['text'],
            "travel_time": element['duration']['text']
        })

    return result

def get_distance_and_duration_for_one_location(origin_lat, origin_lng, dest_lat, dest_lng, mode="driving"):
    origin = f"{origin_lat},{origin_lng}"
    destination = f"{dest_lat},{dest_lng}"

    url = "https://maps.googleapis.com/maps/api/directions/json"
    params = {
        "origin": origin,
        "destination": destination,
        "mode": mode,
        "key": GOOGLE_MAPS_API_KEY
    }

    response = requests.get(url, params=params)
    data = response.json()

    if data["status"] != "OK":
        raise Exception(f"Directions API error: {data.get('error_message', data['status'])}")

    leg = data["routes"][0]["legs"][0]

    return {
        "distance_text": leg["distance"]["text"],
        "distance_meters": leg["distance"]["value"],
        "duration_text": leg["duration"]["text"],
        "duration_seconds": leg["duration"]["value"]
    }

