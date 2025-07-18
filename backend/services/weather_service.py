import httpx    #this is the HTTP client library we use to make web requests asynchronously.
import os       #lets us read environment variables (like API keys).
from dotenv import load_dotenv      #loads your .env file so those environment variables become available.

load_dotenv()

API_KEY = os.getenv("OPENWEATHER_API_KEY")
BASE_URL = "http://api.openweathermap.org/data/2.5/weather"


async def get_weather_by_city(city : str):
    params = {
        "q" : city,
        "appid": API_KEY
    }
    async with httpx.AsyncClient() as client:
        response = await client.get(BASE_URL, params=params)
        response.raise_for_status()
        return response.json()

async def get_weather_forecast_by_city(city : str):
    params = {
        "q" : city,
        "appid": API_KEY
    }
    async with httpx.AsyncClient() as client:
        response = await client.get("https://api.openweathermap.org/data/2.5/forecast", params=params)
        response.raise_for_status()
        return response.json()

# Util function for filtering the weather forecast data
def extract_forecast_data(forecast_data):
    daily_forecasts = []
    added_dates = set()

    for entry in forecast_data.get("list", []):
        dt_txt = entry["dt_txt"]
        date_str, time_str = dt_txt.split()

        if time_str == "12:00:00" and date_str not in added_dates:
            icon_code = entry["weather"][0]["icon"]
            filtered = {
                "date": date_str,
                "temperature": entry["main"]["temp"],
                "weather": entry["weather"][0]["description"],
                "humidity": entry["main"]["humidity"],
                "visibility": entry["visibility"],
                "icon_url": f"http://openweathermap.org/img/wn/{icon_code}@2x.png"
            }

            daily_forecasts.append(filtered)
            added_dates.add(date_str)

    return daily_forecasts