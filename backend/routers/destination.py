from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from io import BytesIO

from backend.database.db import get_db
from backend.models.destination_imgs import DestinationImages

router = APIRouter()

@router.get("/destination-image/{destination_id}")
def get_destination_image(destination_id: int, db: Session = Depends(get_db)):
    image_obj = db.query(DestinationImages).filter(DestinationImages.destination_id == destination_id).first()

    if not image_obj or not image_obj.image:
        raise HTTPException(status_code=404, detail="Image not found")

    return StreamingResponse(BytesIO(image_obj.image), media_type="image/jpeg")
