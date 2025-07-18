from fastapi import APIRouter, HTTPException
from backend.services.hotel_service import get_hotels

router = APIRouter(
    prefix="/hotels",
    tags=["hotels"]
)

@router.get("/")
async def get_hotel(city: str):
    try:
        data = await get_hotels(city)
        print(data)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
