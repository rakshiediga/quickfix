import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Chat, Booking
from app.schemas.schemas import ChatCreate, ChatResponse
from app.services.auth import get_current_user_id, get_current_user_role
from app.core.sockets import manager

router = APIRouter(prefix="/chats", tags=["Direct Messaging"])

@router.get("/history/{booking_id}", response_model=List[ChatResponse])
def get_chat_history(booking_id: str, db: Session = Depends(get_db)):
    chats = db.query(Chat).filter(Chat.booking_id == booking_id).order_by(Chat.created_at.asc()).all()
    return chats

@router.post("/send/{booking_id}", response_model=ChatResponse)
async def send_chat_message(booking_id: str, req: ChatCreate, user_id: str = Depends(get_current_user_id), role: str = Depends(get_current_user_role), db: Session = Depends(get_db)):
    # Verify booking exists
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking details not found")
        
    chat_id = f"msg-{uuid.uuid4().hex[:12]}"
    chat = Chat(
        id=chat_id,
        booking_id=booking_id,
        sender_id=user_id,
        sender_role=role,
        message=req.message
    )
    db.add(chat)
    db.commit()
    db.refresh(chat)
    
    # Broadcast to targets (sender & receiver)
    target_user_id = booking.provider_id if role == "customer" else booking.customer_id
    payload = {
        "type": "new_chat_message",
        "chat": {
            "id": chat.id,
            "booking_id": chat.booking_id,
            "sender_id": chat.sender_id,
            "sender_role": chat.sender_role,
            "message": chat.message,
            "created_at": chat.created_at.isoformat()
        }
    }
    
    # Send message to target participant
    await manager.send_personal_message(payload, target_user_id)
    # Also echo back to the sender
    await manager.send_personal_message(payload, user_id)
    
    return chat
