from sqlalchemy import Column, INTEGER, String, FLOAT

from backend.database.db import Base

class LocationCoordinates(Base):
    __tablename__ = "location_coordinates"

    location_id = Column(INTEGER, primary_key=True, index= True)
    location_name = Column(String)
    latitudes = Column(FLOAT)
    longitudes = Column(FLOAT)



