from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import OperationalError
from app.database import get_db
from app.models.models import User, CustomerProfile
from app.schemas.schemas import CustomerProfileCreate, CustomerProfileResponse
from app.services.auth import get_current_user_id
from app.routers.auth import _memory_users

router = APIRouter(prefix="/customer", tags=["Customer Profiles"])

# In-memory customer profiles fallback store
_memory_customer_profiles = {}

@router.get("/profile", response_model=CustomerProfileResponse)
def get_customer_profile(user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    try:
        profile = db.query(CustomerProfile).filter(CustomerProfile.user_id == user_id).first()
        if not profile:
            raise HTTPException(status_code=404, detail="Customer profile not found")
        return profile
    except OperationalError:
        profile = _memory_customer_profiles.get(user_id)
        if not profile:
            # Create a mock/empty one
            profile = {
                "user_id": user_id,
                "full_name": "New Customer Profile",
                "avatar_url": None,
                "gps_lat": None,
                "gps_lng": None,
                "address": None,
                "city": None,
                "state": None
            }
            _memory_customer_profiles[user_id] = profile
        return profile

@router.post("/profile", response_model=CustomerProfileResponse)
def update_customer_profile(req: CustomerProfileCreate, user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    try:
        profile = db.query(CustomerProfile).filter(CustomerProfile.user_id == user_id).first()
        if not profile:
            profile = CustomerProfile(user_id=user_id)
            db.add(profile)
        
        # Apply changes
        for field, val in req.dict(exclude_unset=True).items():
            setattr(profile, field, val)
            
        # Mark user setup as complete
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            user.setup_complete = True
            
        db.commit()
        db.refresh(profile)
        return profile
    except OperationalError:
        # Save to memory store
        profile = _memory_customer_profiles.get(user_id, {
            "user_id": user_id,
            "full_name": "",
            "avatar_url": None,
            "gps_lat": None,
            "gps_lng": None,
            "address": None,
            "city": None,
            "state": None
        })
        
        for field, val in req.dict(exclude_unset=True).items():
            profile[field] = val
            
        _memory_customer_profiles[user_id] = profile
        
        # Update user status in memory
        for identifier, data in _memory_users.items():
            if data["id"] == user_id:
                data["setup_complete"] = True
                
        return profile
