from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.schemas.booking import BookingCreate, BookingResponse
from app.crud.crud_booking import get_bookings, create_booking

router = APIRouter()

@router.get("/", response_model=List[BookingResponse])
def read_bookings(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return get_bookings(db, skip=skip, limit=limit)

@router.post("/", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
def create_new_booking(booking_in: BookingCreate, db: Session = Depends(get_db)):
    return create_booking(db, booking_in)
