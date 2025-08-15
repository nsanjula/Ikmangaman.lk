from sqlalchemy import Column, INTEGER, ForeignKey, String, DateTime, func
from sqlalchemy.orm import relationship

from backend.database.db import Base

class SavedPlace(Base):
    __tablename__ = 'saved_places'

    id = Column(INTEGER, primary_key=True, index=True)
    user_id = Column(INTEGER, ForeignKey('users.user_id'))
    name = Column(String, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    user = relationship('User', back_populates='saved_places')