from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from app.api.deps import require_admin


router = APIRouter()
UPLOAD_DIR = Path(__file__).resolve().parents[3] / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_TYPES = {
    "image/jpeg": (".jpg", "image"),
    "image/png": (".png", "image"),
    "image/webp": (".webp", "image"),
    "video/mp4": (".mp4", "video"),
    "video/webm": (".webm", "video"),
}
MAX_FILE_SIZE = 20 * 1024 * 1024


@router.post("/upload")
async def upload_media(file: UploadFile = File(...), _admin=Depends(require_admin)):
    file_info = ALLOWED_TYPES.get(file.content_type)
    if not file_info:
        raise HTTPException(
            status_code=400,
            detail="Chỉ hỗ trợ JPG, PNG, WEBP, MP4 hoặc WEBM",
        )

    extension, media_type = file_info
    content = await file.read(MAX_FILE_SIZE + 1)
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File không được vượt quá 20 MB")
    if not content:
        raise HTTPException(status_code=400, detail="File tải lên đang trống")

    filename = f"{uuid4().hex}{extension}"
    (UPLOAD_DIR / filename).write_bytes(content)
    return {"media_url": f"/uploads/{filename}", "media_type": media_type}
