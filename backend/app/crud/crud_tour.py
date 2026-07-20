from sqlalchemy.orm import Session
from uuid import UUID

from app.models.tour import Tour
from app.schemas.tour import TourCreate, TourUpdate


def get_tours(db: Session, skip: int = 0, limit: int = 100, include_hidden: bool = False):
    query = db.query(Tour)
    if not include_hidden:
        query = query.filter(Tour.active.is_(True))
    return query.offset(skip).limit(limit).all()


def get_tour_by_id(db: Session, tour_id: UUID):
    return db.query(Tour).filter(Tour.id == tour_id).first()


def create_tour(db: Session, tour_in: TourCreate):
    tour_data = tour_in.model_dump()
    db_tour = Tour(**tour_data)
    db.add(db_tour)
    db.commit()
    db.refresh(db_tour)
    return db_tour


def update_tour(db: Session, db_tour: Tour, tour_in: TourUpdate):
    update_data = tour_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_tour, field, value)
    db.commit()
    db.refresh(db_tour)
    return db_tour


def delete_tour(db: Session, db_tour: Tour):
    db.delete(db_tour)
    db.commit()
