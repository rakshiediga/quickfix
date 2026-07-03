import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.models import Review, Booking, ProviderProfile, Notification
from app.schemas.schemas import ReviewCreate, ReviewResponse
from app.services.auth import get_current_user_id
from app.core.sockets import manager

router = APIRouter(prefix="/reviews", tags=["Reviews & Ratings"])

@router.post("/submit", response_model=ReviewResponse)
async def submit_review_endpoint(req: ReviewCreate, user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    # Verify booking exists
    booking = db.query(Booking).filter(Booking.id == req.booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking details not found")
        
    review_id = f"rev-{uuid.uuid4().hex[:12]}"
    review = Review(
        id=review_id,
        booking_id=req.booking_id,
        customer_id=user_id,
        provider_id=req.provider_id,
        rating=req.rating,
        comment=req.comment
    )
    db.add(review)
    
    # Recalculate average rating & reviews count
    provider = db.query(ProviderProfile).filter(ProviderProfile.user_id == req.provider_id).first()
    if provider:
        total = (provider.total_reviews or 0) + 1
        avg = ((provider.avg_rating or 0.0) * (provider.total_reviews or 0) + req.rating) / total
        provider.total_reviews = total
        provider.avg_rating = round(avg, 1)
        
    # Write a notification alert to the provider
    notif_id = f"ntf-{uuid.uuid4().hex[:12]}"
    notif = Notification(
        id=notif_id,
        user_id=req.provider_id,
        type="new_review",
        title="⭐ New Review Received!",
        body=f"A customer gave you a {req.rating}-star rating.",
        booking_id=req.booking_id,
        is_read=False
    )
    db.add(notif)
    db.commit()
    db.refresh(review)
    
    # Trigger socket push
    await manager.send_personal_message({
        "type": "new_review",
        "booking_id": req.booking_id,
        "title": notif.title,
        "body": notif.body
    }, req.provider_id)
    
    return review

@router.get("/provider/{provider_id}", response_model=List[ReviewResponse])
def get_provider_reviews(provider_id: str, db: Session = Depends(get_db)):
    reviews = db.query(Review).filter(Review.provider_id == provider_id).order_by(Review.created_at.desc()).all()
    return reviews
