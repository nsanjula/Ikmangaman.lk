from sqlalchemy import INTEGER, Column, ForeignKey, LargeBinary
from sqlalchemy.orm import relationship

from backend.database.db import Base


class DestinationImages(Base):
    __tablename__ = "destination_images"

    image_id = Column(INTEGER, primary_key=True, index=True)
    destination_id = Column(INTEGER, ForeignKey("destination.id"))
    image = Column(LargeBinary)

    destination = relationship("Destination", back_populates="destination_image")

