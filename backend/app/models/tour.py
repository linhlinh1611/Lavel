import uuid

from sqlalchemy import Boolean, Column, Date, Float, Integer, String
from sqlalchemy.dialects.postgresql import UUID

from app.database import Base


class Tour(Base):
    __tablename__ = "tours"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True, nullable=False)
    title = Column(String, nullable=False, index=True)
    location = Column(String, nullable=True, index=True)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    description = Column(String, nullable=True)
    price = Column(Float, nullable=False)
    duration = Column(Integer, nullable=False)  # số ngày
    max_group_size = Column(Integer, nullable=False)
    featured = Column(Boolean, default=False)
    active = Column(Boolean, default=True, nullable=False)
    media_url = Column(String, nullable=True)
    media_type = Column(String, nullable=True)
