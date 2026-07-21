from datetime import date

import pytest
from pydantic import ValidationError

from app.schemas.tour import TourCreate


def make_tour(**overrides):
    data = {
        "title": "Khám phá Hội An",
        "location": "Hội An",
        "start_date": date(2026, 8, 10),
        "end_date": date(2026, 8, 12),
        "description": "Tour tham quan phố cổ Hội An.",
        "price": 2_500_000,
        "duration": 3,
        "max_group_size": 20,
    }
    data.update(overrides)
    return TourCreate(**data)


def test_create_tour_accepts_valid_dates():
    tour = make_tour()

    assert tour.start_date == date(2026, 8, 10)
    assert tour.end_date == date(2026, 8, 12)


def test_create_tour_rejects_end_date_before_start_date():
    with pytest.raises(ValidationError, match="Ngày kết thúc không được trước ngày khởi hành"):
        make_tour(end_date=date(2026, 8, 9))
