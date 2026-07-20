from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# 1. Khởi tạo engine kết nối PostgreSQL
engine = create_engine(settings.DATABASE_URL)

# 2. Tạo Session để thực hiện các phiên truy vấn
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 3. ĐÂY LÀ DÒNG QUAN TRỌNG NHẤT ĐANG BỊ THIẾU:
Base = declarative_base()

# 4. Dependency để mượn và trả kết nối DB cho mỗi API request
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()