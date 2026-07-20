import uuid

from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID

from app.database import Base


class Review(Base):
	__tablename__ = "reviews"

	id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True, nullable=False)
	tour_id = Column(UUID(as_uuid=True), ForeignKey("tours.id"), nullable=False)
	user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
	rating = Column(Integer, nullable=False)
	comment = Column(String, nullable=True)
