from sqlalchemy import INTEGER, Column, ForeignKey, LargeBinary, String
from sqlalchemy.orm import relationship

from backend.database.db import Base


class DestinationImages(Base):
    __tablename__ = "destination_images"

    image_id = Column(INTEGER, primary_key=True, index=True)
    destination_id = Column(INTEGER, ForeignKey("destinations.destination_id"))
    image = Column(LargeBinary)

    destination = relationship("Destination", back_populates="destination_image")

class ImageEmbedding(Base):
    __tablename__ = "image_embeddings"

    image_id = Column(INTEGER, primary_key=True, index=True)
    destination_id = Column(INTEGER, ForeignKey("destinations.destination_id"))
    image_path = Column(String, nullable=True)
    vector = Column(LargeBinary, nullable=True)  # store L2-normalized float32[512]


