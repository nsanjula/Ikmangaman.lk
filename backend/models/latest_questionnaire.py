from sqlalchemy import Column, INTEGER, ForeignKey, BOOLEAN, FLOAT
from sqlalchemy.orm import relationship

from backend.database.db import Base


class LatestQuestionnaire(Base):
    __tablename__ = "latest_questionnaires"

    q_id = Column(INTEGER, primary_key=True, index= True)
    user_id = Column(INTEGER, ForeignKey("users.user_id"))
    nature = Column(BOOLEAN, default=False)
    adventure = Column(BOOLEAN, default=False)
    luxury = Column(BOOLEAN, default=False)
    culture = Column(BOOLEAN, default=False)
    relaxation = Column(BOOLEAN, default=False)
    wellness = Column(BOOLEAN, default=False)
    local_life = Column(BOOLEAN, default=False)
    wildlife = Column(BOOLEAN, default=False)
    food = Column(BOOLEAN, default=False)
    spirituality = Column(BOOLEAN, default=False)
    eco_tourism = Column(BOOLEAN, default=False)
    month = Column(INTEGER) # 1 - 12
    no_of_people = Column(INTEGER)
    starting_location_latitudes = Column(FLOAT)
    starting_location_longitudes = Column(FLOAT)

    user = relationship("User", back_populates="latest_questionnaire")


