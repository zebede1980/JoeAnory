from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Settings
from app.schemas import SettingsOut, SettingsUpdate

router = APIRouter(prefix="/settings", tags=["settings"])

def get_or_create_settings(db: Session) -> Settings:
    settings = db.query(Settings).first()
    if not settings:
        settings = Settings()
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings

@router.get("/", response_model=SettingsOut)
def get_settings(db: Session = Depends(get_db)):
    settings = get_or_create_settings(db)
    return settings

@router.put("/", response_model=SettingsOut)
def update_settings(update: SettingsUpdate, db: Session = Depends(get_db)):
    settings = get_or_create_settings(db)
    for field, value in update.model_dump(exclude_unset=True).items():
        setattr(settings, field, value)
    db.commit()
    db.refresh(settings)
    return settings
