from sqlalchemy import Column, Integer

from backend.database.db import Base

class Transitfare(Base):
    __tablename__ = "transitfares"

    record_id = Column(Integer, primary_key=True, index= True)
    no_of_stops = Column(Integer)
    fare = Column(Integer)
    print("Transit fare table created")


