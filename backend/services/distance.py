import os
import requests
from dotenv import load_dotenv

load_dotenv()

GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")

def get_distance_and_duration(user_location, destinations):
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
