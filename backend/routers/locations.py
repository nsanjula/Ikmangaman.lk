from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from starlette import status
from typing import List

from backend.database.db import get_db
from backend.models import location_coordinates

router = APIRouter(
    tags=["locations"]
)

@router.get("/starting-locations", status_code=status.HTTP_200_OK)
def get_starting_locations(db: Session = Depends(get_db)):
    """Get all available starting locations"""
    locations = db.query(location_coordinates.LocationCoordinates).all()
    
    # Transform to a simple list of location names
    location_names = [location.location_name for location in locations]
    
    return {"locations": sorted(location_names)}

@router.post("/starting-locations", status_code=status.HTTP_201_CREATED)
def add_starting_location(location_name: str, latitude: float, longitude: float, db: Session = Depends(get_db)):
    """Add a new starting location (admin only for future use)"""
    
    # Check if location already exists
    existing = db.query(location_coordinates.LocationCoordinates).filter(
        location_coordinates.LocationCoordinates.location_name == location_name
    ).first()
    
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Location already exists")
    
    new_location = location_coordinates.LocationCoordinates(
        location_name=location_name,
        latitudes=latitude,
        longitudes=longitude
    )
    
    db.add(new_location)
    db.commit()
    db.refresh(new_location)
    
    return {"message": "Location added successfully", "location": location_name}
