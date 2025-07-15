from sqlalchemy import Column, String, INTEGER, LargeBinary
from sqlalchemy.orm import relationship

from backend.database.db import Base
from backend.models.guide_destination import guide_destination  # import the link table


class Guide(Base):
    __tablename__ = "guides"

    guide_id = Column(INTEGER, primary_key=True, index=True)
    name = Column(String)
    gender = Column(String)
    contact_no = Column(String)
    photo = Column(LargeBinary)

    destinations = relationship(
        "Destination",
        secondary=guide_destination,
        back_populates="guides"
    )










