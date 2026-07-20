from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.user import UserCreate, UserLogin, UserResponse
from app.crud import crud_user
from app.core import security
from datetime import timedelta
from app.api.deps import get_current_user

router = APIRouter()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    # check existing
    existing = crud_user.get_user_by_email(db, user_in.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email đã được sử dụng")
    hashed = security.get_password_hash(user_in.password)
    created = crud_user.create_user(db, user_in, hashed)
    return created


@router.post("/login")
def login(user_in: UserLogin, db: Session = Depends(get_db)):
    user = crud_user.get_user_by_email(db, user_in.email)
    if not user or not security.verify_password(user_in.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Email hoặc mật khẩu không đúng")
    access_token_expires = timedelta(minutes=60*24)
    token = security.create_access_token({"sub": str(user.id)}, expires_delta=access_token_expires)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
        },
    }


@router.get("/me")
def read_current_user(current_user=Depends(get_current_user)):
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role,
    }
