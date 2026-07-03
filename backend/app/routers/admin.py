import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import ProviderProfile, Notification
from app.schemas.schemas import ProviderProfileResponse
from app.services.auth import get_current_user_id, get_current_user_role
from app.core.sockets import manager

router = APIRouter(prefix="/admin", tags=["Admin Operations"])

@router.get("/providers", response_model=List[ProviderProfileResponse])
def list_all_providers_admin(db: Session = Depends(get_db)):
    providers = db.query(ProviderProfile).all()
    return providers

@router.put("/approve/{provider_id}")
async def approve_provider_endpoint(provider_id: str, approved: bool, db: Session = Depends(get_db)):
    provider = db.query(ProviderProfile).filter(ProviderProfile.user_id == provider_id).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")
        
    status = "approved" if approved else "rejected"
    provider.approval_status = status
    
    # Save a notification alert to the provider
    notif_id = f"ntf-{uuid.uuid4().hex[:12]}"
    notif = Notification(
        id=notif_id,
        user_id=provider_id,
        type="account_approved" if approved else "account_rejected",
        title="🎉 Account Approved!" if approved else "❌ Application Rejected",
        body="Your profile is now live! Customers can find and book you." if approved else "Your application was not approved. Please contact support.",
        is_read=False
    )
    db.add(notif)
    db.commit()
    
    # Trigger WebSocket alert
    await manager.send_personal_message({
        "type": "account_approved" if approved else "account_rejected",
        "title": notif.title,
        "body": notif.body
    }, provider_id)
    
    return {"message": f"Provider status updated to {status}"}
