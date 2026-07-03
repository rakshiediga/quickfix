import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import OperationalError
from app.database import get_db
from app.models.models import User, CustomerProfile, ProviderProfile
from app.schemas.schemas import SendOtpRequest, VerifyOtpRequest, TokenResponse, UserBase
from app.services.otp import generate_otp, verify_otp, send_otp_email
from app.services.auth import create_access_token, get_current_user_id

router = APIRouter(prefix="/auth", tags=["Authentication"])

# In-memory fallback user store (used when MySQL is not available)
_memory_users: dict = {}

@router.post("/send-otp")
def send_otp_endpoint(req: SendOtpRequest, db: Session = Depends(get_db)):
    identifier = req.phone or req.email
    if not identifier:
        raise HTTPException(status_code=400, detail="Mobile phone or Email address is required")

    code = generate_otp(identifier)
    send_otp_email(identifier, code)
    return {"message": "OTP sent successfully", "demo": False}

@router.post("/verify-otp", response_model=TokenResponse)
def verify_otp_endpoint(req: VerifyOtpRequest, db: Session = Depends(get_db)):
    identifier = req.phone or req.email
    if not identifier:
        raise HTTPException(status_code=400, detail="Mobile phone or Email address is required")

    is_valid = verify_otp(identifier, req.code)
    if not is_valid:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired OTP. Use 123456 for testing.")

    try:
        # Try MySQL first
        user = None
        if req.email:
            user = db.query(User).filter(User.email == req.email).first()
        elif req.phone:
            user = db.query(User).filter(User.phone == req.phone).first()

        if not user:
            user_id = f"usr-{uuid.uuid4().hex[:12]}"
            user = User(
                id=user_id,
                email=req.email,
                phone=req.phone,
                role=req.role,
                setup_complete=False
            )
            db.add(user)
            db.commit()
            db.refresh(user)

            # Create empty profile placeholder
            if req.role == "provider":
                profile = ProviderProfile(
                    user_id=user.id,
                    full_name="New Provider",
                    phone=req.phone,
                    email=req.email,
                    is_available=True,
                    approval_status="pending"
                )
            else:
                profile = CustomerProfile(
                    user_id=user.id,
                    full_name="New Customer"
                )
            db.add(profile)
            db.commit()

        access_token = create_access_token(data={"sub": user.id, "role": user.role})
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user_id": user.id,
            "role": user.role,
            "setup_complete": user.setup_complete
        }

    except OperationalError:
        # MySQL not available — use in-memory fallback
        existing = _memory_users.get(identifier)
        if existing:
            user_id = existing["id"]
            role = existing["role"]
            setup_complete = existing.get("setup_complete", False)
        else:
            user_id = f"mem-{uuid.uuid4().hex[:10]}"
            _memory_users[identifier] = {
                "id": user_id,
                "role": req.role,
                "setup_complete": False,
                "identifier": identifier
            }
            role = req.role
            setup_complete = False

        access_token = create_access_token(data={"sub": user_id, "role": role})
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user_id": user_id,
            "role": role,
            "setup_complete": setup_complete
        }

@router.get("/profile", response_model=UserBase)
def get_user_profile(user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user
    except OperationalError:
        # Return minimal in-memory profile
        for identifier, data in _memory_users.items():
            if data["id"] == user_id:
                return {
                    "id": user_id,
                    "email": identifier if "@" in identifier else None,
                    "phone": identifier if "@" not in identifier else None,
                    "role": data["role"],
                    "setup_complete": data.get("setup_complete", False)
                }
        raise HTTPException(status_code=404, detail="User not found")
