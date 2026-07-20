from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID

from app.api.deps import get_current_user
from app.database import get_db
from app.models.cart_item import CartItem
from app.models.tour import Tour
from app.schemas.cart import CartItemResponse, CartQuantity


router = APIRouter()


def serialize_item(item: CartItem, tour: Tour):
    return {"id": item.id, "quantity": item.quantity, "tour": tour}


@router.get("/", response_model=list[CartItemResponse])
def read_cart(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    rows = (
        db.query(CartItem, Tour)
        .join(Tour, CartItem.tour_id == Tour.id)
        .filter(CartItem.user_id == current_user.id)
        .order_by(CartItem.id)
        .all()
    )
    return [serialize_item(item, tour) for item, tour in rows]


@router.post("/{tour_id}", response_model=CartItemResponse, status_code=status.HTTP_201_CREATED)
def add_to_cart(
    tour_id: UUID,
    quantity_in: CartQuantity,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if current_user.role == "admin":
        raise HTTPException(status_code=403, detail="Tài khoản admin không sử dụng giỏ hàng")
    tour = db.query(Tour).filter(Tour.id == tour_id, Tour.active.is_(True)).first()
    if not tour:
        raise HTTPException(status_code=404, detail="Tour không tồn tại hoặc đã bị ẩn")
    if quantity_in.quantity > tour.max_group_size:
        raise HTTPException(
            status_code=400,
            detail=f"Tour chỉ nhận tối đa {tour.max_group_size} khách",
        )
    item = db.query(CartItem).filter(
        CartItem.user_id == current_user.id,
        CartItem.tour_id == tour_id,
    ).first()
    if item:
        new_quantity = item.quantity + quantity_in.quantity
        if new_quantity > tour.max_group_size:
            raise HTTPException(
                status_code=400,
                detail=f"Giỏ hàng đã có {item.quantity} khách; tour chỉ nhận tối đa {tour.max_group_size} khách",
            )
        item.quantity = new_quantity
    else:
        item = CartItem(user_id=current_user.id, tour_id=tour_id, quantity=quantity_in.quantity)
        db.add(item)
    db.commit()
    db.refresh(item)
    return serialize_item(item, tour)


@router.put("/{item_id}", response_model=CartItemResponse)
def update_cart_item(
    item_id: UUID,
    quantity_in: CartQuantity,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    item = db.query(CartItem).filter(
        CartItem.id == item_id,
        CartItem.user_id == current_user.id,
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Không tìm thấy tour trong giỏ hàng")
    tour = db.query(Tour).filter(Tour.id == item.tour_id).first()
    if quantity_in.quantity > tour.max_group_size:
        raise HTTPException(
            status_code=400,
            detail=f"Tour chỉ nhận tối đa {tour.max_group_size} khách",
        )
    item.quantity = quantity_in.quantity
    db.commit()
    db.refresh(item)
    return serialize_item(item, tour)


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_cart_item(
    item_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    item = db.query(CartItem).filter(
        CartItem.id == item_id,
        CartItem.user_id == current_user.id,
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Không tìm thấy tour trong giỏ hàng")
    db.delete(item)
    db.commit()
