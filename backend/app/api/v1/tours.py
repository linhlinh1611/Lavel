from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.database import get_db
from app.schemas.tour import TourCreate, TourResponse, TourUpdate
from app.crud import crud_tour
from app.api.deps import require_admin

router = APIRouter()

# API 1: Lấy danh sách toàn bộ Tour
@router.get("/", response_model=List[TourResponse])
def read_tours(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    tours = crud_tour.get_tours(db, skip=skip, limit=limit)
    return tours

# API dành cho admin: bao gồm cả tour đã ẩn
@router.get("/admin/all", response_model=List[TourResponse])
def read_all_tours_for_admin(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
):
    return crud_tour.get_tours(db, skip=skip, limit=limit, include_hidden=True)

# API 2: Lấy chi tiết 1 Tour bằng ID
@router.get("/{tour_id}", response_model=TourResponse)
def read_tour(tour_id: UUID, db: Session = Depends(get_db)):
    db_tour = crud_tour.get_tour_by_id(db, tour_id=tour_id)
    if not db_tour or not db_tour.active:
        raise HTTPException(status_code=404, detail="Không tìm thấy Tour du lịch này")
    return db_tour

# API 3: Thêm mới một Tour
@router.post("/", response_model=TourResponse, status_code=status.HTTP_201_CREATED)
def create_new_tour(tour_in: TourCreate, db: Session = Depends(get_db), _admin=Depends(require_admin)):
    return crud_tour.create_tour(db, tour_in)

# API 4: Cập nhật thông tin Tour
@router.put("/{tour_id}", response_model=TourResponse)
def update_existing_tour(tour_id: UUID, tour_in: TourUpdate, db: Session = Depends(get_db), _admin=Depends(require_admin)):
    db_tour = crud_tour.get_tour_by_id(db, tour_id=tour_id)
    if not db_tour:
        raise HTTPException(status_code=404, detail="Không tìm thấy Tour du lịch này để cập nhật")
    return crud_tour.update_tour(db, db_tour=db_tour, tour_in=tour_in)

# API 5: Xóa một Tour
@router.delete("/{tour_id}")
def delete_existing_tour(tour_id: UUID, db: Session = Depends(get_db), _admin=Depends(require_admin)):
    db_tour = crud_tour.get_tour_by_id(db, tour_id=tour_id)
    if not db_tour:
        raise HTTPException(status_code=404, detail="Không tìm thấy Tour du lịch này để xóa")
    crud_tour.delete_tour(db, db_tour=db_tour)
    return {"message": f"Đã xóa thành công tour {db_tour.title}"}
