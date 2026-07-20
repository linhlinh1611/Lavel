from pydantic import BaseModel, Field
from uuid import UUID

from app.schemas.tour import TourResponse


class CartQuantity(BaseModel):
    quantity: int = Field(ge=1)


class CartItemResponse(BaseModel):
    id: UUID
    quantity: int
    tour: TourResponse
