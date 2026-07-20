import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from sqlalchemy import inspect, text

# Import kết nối database và Base model
from app.database import Base, engine
# Import các models để SQLAlchemy biết đường tạo bảng trong Postgres
from app.models.user import User
from app.models.tour import Tour
from app.models.booking import Booking# Import router tổng của API v1
from app.models.site_setting import SiteSetting
from app.models.cart_item import CartItem
from app.api.v1.api import api_router

# 1. Tự động quét các Model và tạo bảng trong PostgreSQL (nếu bảng chưa tồn tại)
try:
    Base.metadata.create_all(bind=engine)
    # create_all does not add new columns to an existing table.
    existing_columns = {column["name"] for column in inspect(engine).get_columns("tours")}
    with engine.begin() as connection:
        if "media_url" not in existing_columns:
            connection.execute(text("ALTER TABLE tours ADD COLUMN media_url VARCHAR"))
        if "media_type" not in existing_columns:
            connection.execute(text("ALTER TABLE tours ADD COLUMN media_type VARCHAR"))
        if "location" not in existing_columns:
            connection.execute(text("ALTER TABLE tours ADD COLUMN location VARCHAR"))
        if "start_date" not in existing_columns:
            connection.execute(text("ALTER TABLE tours ADD COLUMN start_date DATE"))
        if "end_date" not in existing_columns:
            connection.execute(text("ALTER TABLE tours ADD COLUMN end_date DATE"))
        if "active" not in existing_columns:
            connection.execute(text("ALTER TABLE tours ADD COLUMN active BOOLEAN NOT NULL DEFAULT TRUE"))
    print("✅ Đã đồng bộ cấu trúc Database thành công!")
except Exception as e:
    print(f"❌ Lỗi khi đồng bộ Database: {e}")

# 2. Khởi tạo ứng dụng FastAPI (Uvicorn sẽ tìm chính xác biến 'app' này)
app = FastAPI(
    title="Lavel API",
    description="Hệ thống Backend cho Website đặt Tour Du Lịch",
    version="1.0.0"
)

upload_dir = Path(__file__).resolve().parent / "uploads"
upload_dir.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=upload_dir), name="uploads")

# 3. Cấu hình CORS (Cho phép Frontend kết nối tới Backend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Trong thực tế sản xuất sẽ giới hạn lại domain của Frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 4. Gắn các đường dẫn API (Routers) vào hệ thống với tiền tố /api/v1
app.include_router(api_router, prefix="/api/v1")

# 5. Route kiểm tra trạng thái hoạt động của Server tại trang chủ
@app.get("/")
def read_root():
    return {
        "status": "online",
        "message": "Chào Linh! API hệ thống du lịch đang hoạt động cực kỳ ổn định.",
        "documentation": "Truy cập /docs để xem tài liệu chi tiết API"
    }
