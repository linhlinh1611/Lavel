"""Promote an existing account to admin.

Usage:
    python create_admin.py user@example.com
"""

import argparse

from app.crud.crud_user import get_user_by_email
from app.database import SessionLocal


def main():
    parser = argparse.ArgumentParser(description="Cấp quyền admin cho một tài khoản")
    parser.add_argument("email", help="Email tài khoản đã đăng ký")
    args = parser.parse_args()

    db = SessionLocal()
    try:
        user = get_user_by_email(db, args.email)
        if not user:
            raise SystemExit(f"Không tìm thấy tài khoản: {args.email}")
        user.role = "admin"
        db.commit()
        print(f"Đã cấp quyền admin cho {user.email}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
