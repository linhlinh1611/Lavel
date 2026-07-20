import os
from pathlib import Path
from dotenv import load_dotenv

# 1. Xác định thư mục chứa file config.py này (app/core/)
current_file = Path(__file__).resolve()

# 2. Đi ngược ra 2 lần để tìm thư mục 'backend' chứa file '.env'
# app/core/config.py -> app/core/ -> app/ -> backend/
BACKEND_DIR = current_file.parent.parent.parent
env_path = BACKEND_DIR / ".env"

# In ra màn hình console để Linh dễ kiểm tra xem Python đang tìm file .env ở đâu
print(f"🔍 Đang tìm file .env tại đường dẫn: {env_path}")
print(f"📂 File .env có tồn tại không? -> {env_path.exists()}")

# 3. Load file .env một cách trực tiếp
load_dotenv(dotenv_path=env_path)

class Settings:
    # Lấy DATABASE_URL từ file .env vừa nạp
    DATABASE_URL: str = os.getenv("DATABASE_URL")
    SECRET_KEY: str = os.getenv("SECRET_KEY")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 120))

settings = Settings()

# In kiểm tra xem đã lấy được chuỗi kết nối chưa (sẽ ẩn mật khẩu đi cho an toàn)
if settings.DATABASE_URL:
    print("✅ Đã nạp thành công DATABASE_URL từ file .env!")
else:
    print("❌ LỖI: Vẫn chưa nạp được DATABASE_URL! Giá trị đang là None.")