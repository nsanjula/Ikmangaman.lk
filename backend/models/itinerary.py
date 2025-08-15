from sqlalchemy import Column, String, INTEGER, FLOAT, ForeignKey

from backend.database.db import Base

class Itinerary(Base):
    __tablename__ = "trip_plans"

    id = Column(INTEGER, primary_key=True, index=True)
    username = Column(String, ForeignKey("users.username"), nullable=False)
    travel_month = Column(String, nullable=False)
    no_of_people = Column(INTEGER, nullable=False)
    start_location = Column(String, nullable=False)

    day1_dest_id = Column(INTEGER, ForeignKey("destinations.destination_id"), nullable=True)
    day1_budget = Column(FLOAT, nullable=True)

    day2_dest_id = Column(INTEGER, ForeignKey("destinations.destination_id"), nullable=True)
    day2_budget = Column(FLOAT, nullable=True)

    day3_dest_id = Column(INTEGER, ForeignKey("destinations.destination_id"), nullable=True)
    day3_budget = Column(FLOAT, nullable=True)

    day4_dest_id = Column(INTEGER, ForeignKey("destinations.destination_id"), nullable=True)
    day4_budget = Column(FLOAT, nullable=True)

    est_total_budget = Column(FLOAT, nullable=True)

