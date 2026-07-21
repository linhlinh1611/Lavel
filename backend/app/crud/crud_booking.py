from sqlalchemy.orm import Session
from app.models.booking import Booking
from app.schemas.booking import BookingCreate


def get_bookings(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Booking).offset(skip).limit(limit).all()


def create_booking(db: Session, booking_in: BookingCreate):
    booking_data = booking_in.model_dump()
    db_booking = Booking(**booking_data)
    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)
    return db_booking
