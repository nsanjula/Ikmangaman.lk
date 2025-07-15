from sqlalchemy import Table, Column, ForeignKey, Integer
from backend.database.db import Base

guide_destination = Table(
    "guide_destination",
    Base.metadata,
    Column("guide_id", Integer, ForeignKey("guides.guide_id"), primary_key=True),
    Column("destination_id", Integer, ForeignKey("destinations.destination_id"), primary_key=True)
)
