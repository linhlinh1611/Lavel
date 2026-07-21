from datetime import date
from pydantic import BaseModel, model_validator
from uuid import UUID
from typing import Optional

# Các trường chung của Tour
class TourBase(BaseModel):
    title: str
    location: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    description: Optional[str] = None
    price: float
    duration: int
    max_group_size: int
    featured: Optional[bool] = False
    active: Optional[bool] = True
    media_url: Optional[str] = None
    media_type: Optional[str] = None


# Schema dùng để nhận dữ liệu khi thêm mới Tour (Yêu cầu đầy đủ thông tin)
class TourCreate(TourBase):
    @model_validator(mode="after")
    def validate_dates(self):
        if self.start_date and self.end_date and self.end_date < self.start_date:
            raise ValueError("Ngày kết thúc không được trước ngày khởi hành")
        return self


# Schema dùng để cập nhật thông tin Tour (Các trường đều là tùy chọn)
class TourUpdate(BaseModel):
    title: Optional[str] = None
    location: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    description: Optional[str] = None
    price: Optional[float] = None
    duration: Optional[int] = None
    max_group_size: Optional[int] = None
    featured: Optional[bool] = None
    active: Optional[bool] = None
    media_url: Optional[str] = None
    media_type: Optional[str] = None

    @model_validator(mode="after")
    def validate_dates(self):
        if self.start_date and self.end_date and self.end_date < self.start_date:
            raise ValueError("Ngày kết thúc không được trước ngày khởi hành")
        return self


# Schema dùng để trả dữ liệu Tour về cho Client
class TourResponse(TourBase):
    id: UUID

    class Config:
        from_attributes = True
