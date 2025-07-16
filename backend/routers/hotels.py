from fastapi import APIRouter, HTTPException
from backend.services.hotel_service import get_hotels

router = APIRouter()

@router.get("/hotels/{city_code}")
async def get_hotel(city_code: str):
    try:
        data = await get_hotels(city_code)
        print(data)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))