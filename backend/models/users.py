from sqlalchemy import Column, Integer, String, Date
from sqlalchemy.orm import relationship

from backend.database.db import Base


class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    firstname = Column(String)
    lastname = Column(String)
    date_0f_birth = Column(Date)
    username = Column(String)
    password = Column(String)

    latest_questionnaire = relationship("LatestQuestionnaire", back_populates="user")

