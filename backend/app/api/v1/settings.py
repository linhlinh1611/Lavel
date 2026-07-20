from pydantic import BaseModel
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import require_admin
from app.database import get_db
from app.models.site_setting import SiteSetting


router = APIRouter()
HERO_KEY = "homepage_hero_image"
DEFAULT_HERO = "/uploads/default-travel-hero.png"


class HeroSetting(BaseModel):
    hero_image_url: str


@router.get("/hero", response_model=HeroSetting)
def get_hero_setting(db: Session = Depends(get_db)):
    setting = db.query(SiteSetting).filter(SiteSetting.key == HERO_KEY).first()
    return {"hero_image_url": setting.value if setting else DEFAULT_HERO}


@router.put("/hero", response_model=HeroSetting)
def update_hero_setting(
    setting_in: HeroSetting,
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
):
    setting = db.query(SiteSetting).filter(SiteSetting.key == HERO_KEY).first()
    if setting:
        setting.value = setting_in.hero_image_url
    else:
        setting = SiteSetting(key=HERO_KEY, value=setting_in.hero_image_url)
        db.add(setting)
    db.commit()
    return setting_in
