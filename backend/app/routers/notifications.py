from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Notification
from app.schemas.schemas import NotificationResponse
from app.services.auth import get_current_user_id

router = APIRouter(prefix="/notifications", tags=["System Notifications"])

@router.get("/list", response_model=List[NotificationResponse])
def get_user_notifications(user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    notifications = db.query(Notification).filter(Notification.user_id == user_id).order_by(Notification.created_at.desc()).limit(50).all()
    return notifications

@router.put("/read")
def mark_user_notifications_read(user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    db.query(Notification).filter(Notification.user_id == user_id, Notification.is_read == False).update({"is_read": True}, synchronize_session=False)
    db.commit()
    return {"message": "Notifications marked as read"}
