"""Create one complete sample tour for every destination used by the frontend."""

from datetime import date, timedelta

from app.database import SessionLocal
from app.models.tour import Tour


REGIONS = {
    "Miền Bắc": {
        "image": "/uploads/region-north.png",
        "destinations": [
            "Hà Nội", "Hạ Long", "Bái Tử Long", "Cô Tô", "Cát Bà", "Đồ Sơn",
            "Ninh Bình", "Tràng An", "Tam Đảo", "Sa Pa", "Y Tý", "Bắc Hà",
            "Hà Giang", "Đồng Văn", "Mèo Vạc", "Hoàng Su Phì", "Mộc Châu",
            "Tà Xùa", "Mai Châu", "Điện Biên", "Mù Cang Chải", "Hồ Ba Bể",
            "Thác Bản Giốc", "Lạng Sơn", "Yên Tử",
        ],
    },
    "Miền Trung": {
        "image": "/uploads/region-central.png",
        "destinations": [
            "Phong Nha – Kẻ Bàng", "Đồng Hới", "Huế", "Lăng Cô", "Đà Nẵng",
            "Hội An", "Thánh địa Mỹ Sơn", "Cù Lao Chàm", "Lý Sơn", "Quy Nhơn",
            "Kỳ Co – Eo Gió", "Phú Yên", "Gành Đá Đĩa", "Nha Trang",
            "Cam Ranh", "Ninh Chữ", "Vĩnh Hy", "Phan Rang", "Phan Thiết – Mũi Né",
        ],
    },
    "Tây Nguyên": {
        "image": "/uploads/region-highlands.png",
        "destinations": [
            "Đà Lạt", "Bảo Lộc", "Măng Đen", "Buôn Ma Thuột", "Hồ Lắk",
            "Pleiku", "Biển Hồ T’Nưng", "Kon Tum", "Tà Đùng",
        ],
    },
    "Miền Nam": {
        "image": "/uploads/region-south.png",
        "destinations": [
            "TP. Hồ Chí Minh", "Vũng Tàu", "Hồ Tràm", "Long Hải", "Côn Đảo",
            "Tây Ninh", "Cần Thơ", "Châu Đốc", "Hà Tiên", "Phú Quốc",
            "Nam Du", "Hòn Sơn", "Rạch Giá", "Bến Tre", "Mỹ Tho", "Đồng Tháp",
            "Trà Vinh", "Sóc Trăng", "Bạc Liêu", "Cà Mau", "Rừng U Minh",
        ],
    },
}

REGION_EXPERIENCES = {
    "Miền Bắc": "khám phá cảnh quan núi non, văn hóa bản địa và những món ăn đặc trưng miền Bắc",
    "Miền Trung": "tận hưởng biển xanh, di sản văn hóa và ẩm thực đặc sắc miền Trung",
    "Tây Nguyên": "chạm vào thiên nhiên cao nguyên, rừng thông, thác nước và văn hóa bản địa",
    "Miền Nam": "trải nghiệm nhịp sống phương Nam, sông nước, biển đảo và ẩm thực địa phương",
}


def main():
    db = SessionLocal()
    created = 0
    skipped = 0
    base_date = date.today() + timedelta(days=14)
    global_index = 0
    try:
        for region, config in REGIONS.items():
            for destination in config["destinations"]:
                title = f"Tour khám phá {destination}"
                exists = db.query(Tour).filter(Tour.title == title).first()
                if exists:
                    skipped += 1
                    global_index += 1
                    continue

                duration = 3 + (global_index % 3)
                start_date = base_date + timedelta(days=global_index * 3)
                end_date = start_date + timedelta(days=duration - 1)
                price = 2_490_000 + (global_index % 6) * 550_000
                description = (
                    f"Hành trình {duration} ngày đến {destination}, nơi bạn sẽ "
                    f"{REGION_EXPERIENCES[region]}. Tour bao gồm lịch trình chọn lọc, "
                    "hướng dẫn viên đồng hành, thời gian tham quan hợp lý và nhiều "
                    "khoảnh khắc đáng nhớ dành cho gia đình hoặc nhóm bạn."
                )
                db.add(Tour(
                    title=title,
                    location=destination,
                    start_date=start_date,
                    end_date=end_date,
                    description=description,
                    price=price,
                    duration=duration,
                    max_group_size=12 + (global_index % 4) * 4,
                    featured=global_index % 8 == 0,
                    active=True,
                    media_url=config["image"],
                    media_type="image",
                ))
                created += 1
                global_index += 1
        db.commit()
        print(f"Đã tạo {created} tour; bỏ qua {skipped} tour đã tồn tại.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
