from fastapi import APIRouter, HTTPException
from httpx import HTTPStatusError

from backend.services.weather_service import get_weather_by_city,get_weather_forecast_by_city,extract_forecast_data

router = APIRouter(prefix="/weather", tags=["weather"])

@router.get("/")
async def get_weather(city: str):
    try:
        weather_data = await get_weather_by_city(city)
        print("Weather data is ", weather_data)
        return{
            "city": weather_data["name"],
            "country": weather_data["sys"]["country"],
            "temperature": weather_data["main"]["temp"],
            "description": weather_data["weather"][0]["description"]
        }
    except HTTPStatusError as e:
        if e.response.status_code == 404:
            raise HTTPException(status_code=404, detail="City not found")
        else:
            raise HTTPException(status_code=500, detail="Weather API error")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/forecast")
async def get_forecast(city: str):
    try:
        forecast_data = await get_weather_forecast_by_city(city)
        print("Weather forecast data is ", forecast_data)
        filtered_data = extract_forecast_data(forecast_data)
        return filtered_data
    except HTTPStatusError as e:
        if e.response.status_code == 404:
            raise HTTPException(status_code=404, detail="City not found")
        else:
            raise HTTPException(status_code=500, detail="Weather API error")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))