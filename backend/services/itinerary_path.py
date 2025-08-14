import urllib.parse
import os
import requests
from dotenv import load_dotenv

load_dotenv()

GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")

def get_route_polyline(start_lat, start_lng, waypoints):
    """
    waypoints: list of (lat, lng) tuples for intermediate stops
    """
    waypoints_str = "|".join(f"{lat},{lng}" for lat, lng in waypoints[:-1])
    destination = f"{waypoints[-1][0]},{waypoints[-1][1]}"

    url = (
        f"https://maps.googleapis.com/maps/api/directions/json?"
        f"origin={start_lat},{start_lng}"
        f"&destination={destination}"
        f"&waypoints={waypoints_str}"
        f"&key={GOOGLE_MAPS_API_KEY}"
    )

    response = requests.get(url)
    data = response.json()

    if data["status"] != "OK":
        raise ValueError(f"Directions API error: {data['status']}")

    return data["routes"][0]["overview_polyline"]["points"]

def generate_route_map_url(start_lat, start_lng, days):
    """
    Generate a Google Static Maps route image URL.

    Args:
        start_lat (float): Starting point latitude.
        start_lng (float): Starting point longitude.
        days (list[dict]): List of day destinations with lat/lng.

    Returns:
        str: Fully constructed Google Static Maps API URL.
    """

    # Get encoded polyline from Directions API
    waypoints = [(d["latitude"], d["longitude"]) for d in days]
    polyline = get_route_polyline(start_lat, start_lng, waypoints)

    base_url = "https://maps.googleapis.com/maps/api/staticmap"

    # Markers: Start marker with 'S'
    markers = []
    markers.append(f"markers=label:S%7C{start_lat},{start_lng}")

    # Numbered destination markers
    for i, (lat, lng) in enumerate([(d["latitude"], d["longitude"]) for d in days], start=1):
        markers.append(f"markers=label:{i}%7C{lat},{lng}")

    markers_param = "&".join(markers)

    # Path using polyline
    path = f"path=enc:{polyline}"

    return f"{base_url}?size=1024x768&{markers_param}&{path}&key={GOOGLE_MAPS_API_KEY}"
