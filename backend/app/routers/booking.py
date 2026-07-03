import uuid
import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import OperationalError
from app.database import get_db
from app.models.models import Booking, CustomerProfile, ProviderProfile, Notification
from app.schemas.schemas import BookingCreate, BookingResponse, BookingStatusUpdate
from app.services.auth import get_current_user_id, get_current_user_role
from app.core.sockets import manager

router = APIRouter(prefix="/booking", tags=["Bookings Manager"])

# In-memory bookings store
_memory_bookings = {}

@router.post("/create", response_model=BookingResponse)
async def create_booking_endpoint(req: BookingCreate, user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    booking_id = f"BK{uuid.uuid4().hex[:7].upper()}"
    now = datetime.datetime.utcnow()
    
    try:
        # Verify customer details
        customer = db.query(CustomerProfile).filter(CustomerProfile.user_id == user_id).first()
        if not customer:
            raise HTTPException(status_code=404, detail="Customer profile must be configured first")
            
        booking = Booking(
            id=booking_id,
            customer_id=user_id,
            provider_id=req.provider_id,
            service_name=req.service_name,
            scheduled_at=req.scheduled_at,
            address=req.address,
            notes=req.notes,
            amount=req.amount,
            status="pending"
        )
        db.add(booking)
        
        # Save a notification log to the provider
        notif_id = f"ntf-{uuid.uuid4().hex[:12]}"
        notif = Notification(
            id=notif_id,
            user_id=req.provider_id,
            type="new_booking",
            title="🔔 New Booking Request!",
            body=f"A customer has requested: {req.service_name}",
            booking_id=booking_id,
            is_read=False
        )
        db.add(notif)
        db.commit()
        db.refresh(booking)
        
        # Push real-time WS alert to provider if connected
        await manager.send_personal_message({
            "type": "new_booking",
            "booking_id": booking_id,
            "title": notif.title,
            "body": notif.body
        }, req.provider_id)
        
        return booking
    except OperationalError:
        # Fallback to memory
        booking = {
            "id": booking_id,
            "customer_id": user_id,
            "provider_id": req.provider_id,
            "service_name": req.service_name,
            "scheduled_at": req.scheduled_at,
            "address": req.address,
            "notes": req.notes,
            "amount": req.amount,
            "status": "pending",
            "completed_at": None,
            "created_at": now,
            "updated_at": now,
            "customer": {
                "full_name": "Demo Customer",
                "avatar_url": None,
                "address": req.address
            },
            "provider": {
                "full_name": "Demo Provider",
                "profession": req.service_name
            }
        }
        _memory_bookings[booking_id] = booking
        
        # Notify provider via WS
        await manager.send_personal_message({
            "type": "new_booking",
            "booking_id": booking_id,
            "title": "🔔 New Booking Request!",
            "body": f"A customer has requested: {req.service_name}"
        }, req.provider_id)
        
        return booking

@router.get("/list", response_model=List[BookingResponse])
def get_user_bookings(user_id: str = Depends(get_current_user_id), role: str = Depends(get_current_user_role), db: Session = Depends(get_db)):
    try:
        if role == "provider":
            bookings = db.query(Booking).filter(Booking.provider_id == user_id).order_by(Booking.created_at.desc()).all()
        else:
            bookings = db.query(Booking).filter(Booking.customer_id == user_id).order_by(Booking.created_at.desc()).all()
        return bookings
    except OperationalError:
        # Get from memory
        results = []
        for b_id, b in _memory_bookings.items():
            if role == "provider" and b["provider_id"] == user_id:
                results.append(b)
            elif role != "provider" and b["customer_id"] == user_id:
                results.append(b)
        results.sort(key=lambda x: x["created_at"], reverse=True)
        return results

@router.get("/detail/{booking_id}", response_model=BookingResponse)
def get_booking_details(booking_id: str, db: Session = Depends(get_db)):
    try:
        booking = db.query(Booking).filter(Booking.id == booking_id).first()
        if not booking:
            raise HTTPException(status_code=404, detail="Booking record not found")
        return booking
    except OperationalError:
        booking = _memory_bookings.get(booking_id)
        if not booking:
            raise HTTPException(status_code=404, detail="Booking record not found")
        return booking

@router.put("/status/{booking_id}", response_model=BookingResponse)
async def update_booking_status_endpoint(booking_id: str, req: BookingStatusUpdate, db: Session = Depends(get_db)):
    now = datetime.datetime.utcnow()
    
    notify_map = {
        "accepted": {
            "title": "✅ Booking Accepted!",
            "body": "Your booking request has been accepted. Provider is on the way.",
            "type": "booking_accepted"
        },
        "cancelled": {
            "title": "❌ Booking Rejected",
            "body": "Your booking request was declined. Try another provider.",
            "type": "booking_rejected"
        },
        "in_progress": {
            "title": "🔧 Service Started",
            "body": "The provider has started working on your request.",
            "type": "service_started"
        },
        "completed": {
            "title": "🎉 Service Completed!",
            "body": "Service done! Please rate your experience.",
            "type": "service_completed"
        }
    }
    
    try:
        booking = db.query(Booking).filter(Booking.id == booking_id).first()
        if not booking:
            raise HTTPException(status_code=404, detail="Booking record not found")
            
        booking.status = req.status
        booking.updated_at = now
        
        if req.status == "completed":
            booking.completed_at = now
            
        # Save notification log to customer
        if req.status in notify_map:
            meta = notify_map[req.status]
            notif_id = f"ntf-{uuid.uuid4().hex[:12]}"
            notif = Notification(
                id=notif_id,
                user_id=booking.customer_id,
                type=meta["type"],
                title=meta["title"],
                body=meta["body"],
                booking_id=booking_id,
                is_read=False
            )
            db.add(notif)
            
            # Real-time WebSocket push back to customer
            await manager.send_personal_message({
                "type": meta["type"],
                "booking_id": booking_id,
                "title": meta["title"],
                "body": meta["body"],
                "status": req.status
            }, booking.customer_id)
            
        db.commit()
        db.refresh(booking)
        return booking
    except OperationalError:
        booking = _memory_bookings.get(booking_id)
        if not booking:
            raise HTTPException(status_code=404, detail="Booking record not found")
            
        booking["status"] = req.status
        booking["updated_at"] = now
        
        if req.status == "completed":
            booking["completed_at"] = now
            
        # Send WS notify
        if req.status in notify_map:
            meta = notify_map[req.status]
            await manager.send_personal_message({
                "type": meta["type"],
                "booking_id": booking_id,
                "title": meta["title"],
                "body": meta["body"],
                "status": req.status
            }, booking["customer_id"])
            
        return booking
