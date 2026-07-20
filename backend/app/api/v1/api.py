from fastapi import APIRouter
# Thay vì import app.api.v1, hãy sửa thành thế này:
from . import auth, cart, media, settings, tours

api_router = APIRouter()

# Các API liên quan tới tài khoản
api_router.include_router(auth.router, prefix="/auth", tags=["Xác thực người dùng"])

# Các API liên quan tới Tour du lịch
api_router.include_router(tours.router, prefix="/tours", tags=["Quản lý Tour du lịch"])
api_router.include_router(media.router, prefix="/media", tags=["Media"])
api_router.include_router(settings.router, prefix="/settings", tags=["Cấu hình giao diện"])
api_router.include_router(cart.router, prefix="/cart", tags=["Giỏ hàng"])
