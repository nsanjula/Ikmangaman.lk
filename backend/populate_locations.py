#!/usr/bin/env python3
"""
Script to populate the database with starting locations
Run this script to add the starting locations to the database
"""

from sqlalchemy.orm import Session
from backend.database.db import engine, SessionLocal
from backend.models import location_coordinates

# Starting locations with approximate coordinates
STARTING_LOCATIONS = [
    {"name": "Colombo", "lat": 6.9271, "lng": 79.8612},
    {"name": "Kandy", "lat": 7.2906, "lng": 80.6337},
    {"name": "Galle", "lat": 6.0535, "lng": 80.2210},
    {"name": "Jaffna", "lat": 9.6615, "lng": 80.0255},
    {"name": "Trincomalee", "lat": 8.5874, "lng": 81.2152},
    {"name": "Anuradhapura", "lat": 8.3114, "lng": 80.4037},
    {"name": "Pollonaruwa", "lat": 7.9403, "lng": 81.0188},
    {"name": "Nuwara Eliya", "lat": 6.9497, "lng": 80.7891},
    {"name": "Ella", "lat": 6.8667, "lng": 81.0667},
    {"name": "Matara", "lat": 5.9485, "lng": 80.5353},
    {"name": "Negombo", "lat": 7.2084, "lng": 79.8380},
    {"name": "Batticaloa", "lat": 7.7102, "lng": 81.6924},
    {"name": "Badulla", "lat": 6.9934, "lng": 81.0550},
    {"name": "Kurunegala", "lat": 7.4818, "lng": 80.3609},
    {"name": "Ratnapura", "lat": 6.6828, "lng": 80.4037},
    {"name": "Hambantota", "lat": 6.1241, "lng": 81.1185},
    {"name": "Puttalam", "lat": 8.0362, "lng": 79.8283},
    {"name": "Vavniya", "lat": 8.7514, "lng": 80.4971},
    {"name": "Kalutara", "lat": 6.5854, "lng": 79.9607},
    {"name": "Ampara", "lat": 7.2981, "lng": 81.6821},
]

def populate_locations():
    """Populate the database with starting locations"""
    db = SessionLocal()
    
    try:
        print("Starting to populate locations...")
        
        for location_data in STARTING_LOCATIONS:
            # Check if location already exists
            existing = db.query(location_coordinates.LocationCoordinates).filter(
                location_coordinates.LocationCoordinates.location_name == location_data["name"]
            ).first()
            
            if existing:
                print(f"Location '{location_data['name']}' already exists, skipping...")
                continue
            
            # Create new location
            new_location = location_coordinates.LocationCoordinates(
                location_name=location_data["name"],
                latitudes=location_data["lat"],
                longitudes=location_data["lng"]
            )
            
            db.add(new_location)
            print(f"Added location: {location_data['name']}")
        
        db.commit()
        print("\n✅ Successfully populated all starting locations!")
        
        # Verify the count
        total_locations = db.query(location_coordinates.LocationCoordinates).count()
        print(f"Total locations in database: {total_locations}")
        
    except Exception as e:
        print(f"❌ Error populating locations: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    populate_locations()
