from sqlalchemy import Column, Integer, String, FLOAT, BOOLEAN
from sqlalchemy.orm import relationship

from backend.database.db import Base
from backend.models.guide_destination import guide_destination

class Destination(Base):
    __tablename__ = "destinations"

    destination_id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    latitude = Column(FLOAT, nullable=False)
    longitude = Column(FLOAT, nullable=False)
    season_0 = Column(FLOAT, default=0)
    season_1 = Column(FLOAT, default=0)
    season_2 = Column(FLOAT, default=0)
    season_3 = Column(FLOAT, default=0)
    nature_lover = Column(BOOLEAN, default=False)
    luxury_traveler = Column(BOOLEAN, default=False)
    relaxation_seeker = Column(BOOLEAN, default=False)
    culture_seeker = Column(BOOLEAN, default=False)
    adventurer = Column(BOOLEAN, default=False)
    backpacker = Column(BOOLEAN, default=False)
    food_explorer = Column(BOOLEAN, default=False)
    spiritual_traveler = Column(BOOLEAN, default=False)
    eco_conscious_traveler = Column(BOOLEAN, default=False)
    description = Column(String)
    things_to_do = Column(String)   # string separated by '/'
    avg_cost = Column(FLOAT)    # average accommodation, things to do, food cost for one person for one day
    hill_country = Column(BOOLEAN, default=False)
    coastal = Column(BOOLEAN, default=False)
    dry_zone = Column(BOOLEAN, default=False)
    urban = Column(BOOLEAN, default=False)

    destination_image = relationship("DestinationImages", back_populates="destination")

    guides = relationship(
        "Guide",
        secondary=guide_destination,
        back_populates="destinations"
    )









